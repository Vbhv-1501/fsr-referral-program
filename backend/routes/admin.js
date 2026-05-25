// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const referralService = require('../services/referral');
const telegramService = require('../services/telegram');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimit');

router.use(requireAuth, requireAdmin, adminLimiter);

// ─── DASHBOARD ANALYTICS ────────────────────────────────────

/**
 * GET /admin/dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [stats, growth, topPromoters, recentSignups, fraudCount] = await Promise.all([
      db.query(`SELECT * FROM platform_stats WHERE id = 1`),
      db.query(`
        SELECT
          TO_CHAR(created_at, 'YYYY-MM-DD') AS day,
          COUNT(*) AS signups
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY day ORDER BY day ASC
      `),
      db.query(`
        SELECT u.username, u.first_name, u.telegram_id, u.valid_referrals
        FROM users u WHERE u.is_banned = FALSE
        ORDER BY u.valid_referrals DESC LIMIT 10
      `),
      db.query(`
        SELECT id, telegram_id, username, first_name, created_at
        FROM users ORDER BY created_at DESC LIMIT 10
      `),
      db.query(`
        SELECT COUNT(*) FROM referrals WHERE status = 'fraud'
      `),
    ]);

    res.json({
      stats: stats.rows[0],
      growth: growth.rows,
      topPromoters: topPromoters.rows,
      recentSignups: recentSignups.rows,
      fraudCount: parseInt(fraudCount.rows[0].count),
    });
  } catch (err) {
    console.error('GET /admin/dashboard:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── USER MANAGEMENT ───────────────────────────────────────

/**
 * GET /admin/users?search=&page=1&limit=20&filter=all|banned|fraud
 */
router.get('/users', async (req, res) => {
  try {
    const { search = '', filter = 'all' } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (u.username ILIKE $${params.length} OR u.first_name ILIKE $${params.length} OR u.telegram_id::TEXT = $${params.length})`;
    }
    if (filter === 'banned') whereClause += ' AND u.is_banned = TRUE';
    if (filter === 'fraud') {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM referrals r WHERE r.referrer_id = u.id AND r.status = 'fraud'
      )`;
    }

    params.push(limit, offset);

    const result = await db.query(
      `SELECT
         u.id, u.telegram_id, u.username, u.first_name, u.photo_url,
         u.valid_referrals, u.pending_referrals, u.rejected_referrals,
         u.is_banned, u.ban_reason, u.is_channel_member, u.created_at
       FROM users u
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countParams = params.slice(0, -2);
    const countResult = await db.query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      countParams
    );

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      pages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (err) {
    console.error('GET /admin/users:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /admin/users/:id/ban
 */
router.post('/users/:id/ban', async (req, res) => {
  try {
    const { reason = 'Banned by admin' } = req.body;
    await db.query(
      `UPDATE users SET is_banned = TRUE, ban_reason = $1 WHERE id = $2`,
      [reason, req.params.id]
    );
    // Invalidate all their referrals
    await db.query(
      `UPDATE referrals SET status = 'rejected', fraud_reason = 'Referrer banned'
       WHERE referrer_id = $1 AND status = 'valid'`,
      [req.params.id]
    );
    await db.query(`SELECT recompute_referral_counts($1)`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/users/:id/unban
 */
router.post('/users/:id/unban', async (req, res) => {
  try {
    await db.query(
      `UPDATE users SET is_banned = FALSE, ban_reason = NULL WHERE id = $1`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/users/:id/reset-referrals
 */
router.post('/users/:id/reset-referrals', async (req, res) => {
  try {
    await db.query(
      `UPDATE referrals SET status = 'rejected', fraud_reason = 'Admin reset'
       WHERE referrer_id = $1`,
      [req.params.id]
    );
    await db.query(`SELECT recompute_referral_counts($1)`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REFERRAL MANAGEMENT ───────────────────────────────────

/**
 * GET /admin/referrals?status=&page=1
 */
router.get('/referrals', async (req, res) => {
  try {
    const { status } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const whereClause = status ? `WHERE r.status = $1` : 'WHERE 1=1';
    const params = status ? [status, limit, offset] : [limit, offset];
    const limitIdx = status ? 2 : 1;

    const result = await db.query(
      `SELECT
         r.id, r.status, r.fraud_reason, r.created_at, r.verified_at,
         r.ip_address,
         referrer.username AS referrer_username, referrer.first_name AS referrer_name,
         referred.username AS referred_username, referred.first_name AS referred_name,
         r.referred_telegram_id
       FROM referrals r
       JOIN users referrer ON referrer.id = r.referrer_id
       JOIN users referred ON referred.id = r.referred_id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${limitIdx} OFFSET $${limitIdx + 1}`,
      params
    );

    res.json({ referrals: result.rows, page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/referrals/:id/approve
 */
router.post('/referrals/:id/approve', async (req, res) => {
  try {
    const ref = await db.query(
      `UPDATE referrals SET status = 'valid', verified_at = NOW()
       WHERE id = $1 RETURNING referrer_id`,
      [req.params.id]
    );
    if (ref.rows.length) {
      await db.query(`SELECT recompute_referral_counts($1)`, [ref.rows[0].referrer_id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/referrals/:id/reject
 */
router.post('/referrals/:id/reject', async (req, res) => {
  try {
    const { reason = 'Rejected by admin' } = req.body;
    const ref = await db.query(
      `UPDATE referrals SET status = 'rejected', fraud_reason = $1
       WHERE id = $2 RETURNING referrer_id`,
      [reason, req.params.id]
    );
    if (ref.rows.length) {
      await db.query(`SELECT recompute_referral_counts($1)`, [ref.rows[0].referrer_id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CONTEST MANAGEMENT ────────────────────────────────────

/**
 * POST /admin/contest/reset
 * End current month's contest: pick winners, save to winners table, reset leaderboard
 */
router.post('/contest/reset', async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Fetch top 3
    const winners = await db.query(
      `SELECT lb.user_id, lb.monthly_referrals, lb.rank
       FROM leaderboard lb
       JOIN users u ON u.id = lb.user_id
       WHERE lb.contest_month = $1 AND u.is_banned = FALSE
       ORDER BY lb.monthly_referrals DESC LIMIT 3`,
      [currentMonth]
    );

    const rewardMap = { 1: 5000, 2: 2000, 3: 1000 };

    for (const [idx, w] of winners.rows.entries()) {
      const rank = idx + 1;
      const amount = rewardMap[rank] || 0;

      await db.query(
        `INSERT INTO winners (user_id, rank_achieved, referrals, reward_amount, contest_month)
         VALUES ($1, $2, $3, $4, $5)`,
        [w.user_id, rank, w.monthly_referrals, amount, currentMonth]
      );

      await db.query(
        `INSERT INTO rewards (user_id, rank_achieved, reward_amount, reward_month, status)
         VALUES ($1, $2, $3, $4, 'approved')`,
        [w.user_id, rank, amount, currentMonth]
      );

      // Update platform stats
      await db.query(
        `UPDATE platform_stats SET total_rewards_dist = total_rewards_dist + $1 WHERE id = 1`,
        [amount]
      );
    }

    res.json({
      success: true,
      month: currentMonth,
      winners: winners.rows,
    });
  } catch (err) {
    console.error('POST /admin/contest/reset:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/verify/run
 * Manually trigger daily verification job
 */
router.post('/verify/run', async (req, res) => {
  try {
    const result = await referralService.runDailyVerification();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/stats/platform
 */
router.get('/stats/platform', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM platform_stats WHERE id = 1`);
    const channelCount = await telegramService.getMemberCount();
    res.json({ ...result.rows[0], telegram_members: channelCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
