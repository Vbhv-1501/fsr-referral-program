// backend/routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const referralService = require('../services/referral');
const { requireAuth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(apiLimiter);

/**
 * GET /user/profile
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         u.id, u.telegram_id, u.username, u.first_name, u.last_name, u.photo_url,
         u.referral_code, u.referrals_count, u.valid_referrals,
         u.pending_referrals, u.rejected_referrals,
         u.is_channel_member, u.created_at,
         lb.rank, lb.monthly_referrals, lb.weekly_referrals, lb.badges
       FROM users u
       LEFT JOIN leaderboard lb ON lb.user_id = u.id
         AND lb.contest_month = TO_CHAR(NOW(), 'YYYY-MM')
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];

    // Compute rank progress (how many referrals to next rank)
    const nextRankResult = await db.query(
      `SELECT monthly_referrals
       FROM leaderboard
       WHERE contest_month = TO_CHAR(NOW(), 'YYYY-MM')
         AND rank < $1
       ORDER BY rank DESC
       LIMIT 1`,
      [user.rank || 999999]
    );

    const referralsToNextRank = nextRankResult.rows.length
      ? nextRankResult.rows[0].monthly_referrals - user.monthly_referrals + 1
      : null;

    res.json({ user: { ...user, referralsToNextRank } });
  } catch (err) {
    console.error('GET /user/profile:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /user/referrals?page=1&limit=20
 */
router.get('/referrals', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const data = await referralService.getUserReferrals(req.user.id, page, limit);
    res.json(data);
  } catch (err) {
    console.error('GET /user/referrals:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /user/stats
 * Returns detailed stats for the dashboard
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [statsResult, monthlyResult, weeklyResult] = await Promise.all([
      db.query(
        `SELECT valid_referrals, pending_referrals, rejected_referrals, referrals_count
         FROM users WHERE id = $1`,
        [req.user.id]
      ),
      db.query(
        `SELECT COUNT(*) FROM referrals
         WHERE referrer_id = $1 AND status = 'valid'
           AND created_at >= DATE_TRUNC('month', NOW())`,
        [req.user.id]
      ),
      db.query(
        `SELECT COUNT(*) FROM referrals
         WHERE referrer_id = $1 AND status = 'valid'
           AND created_at >= DATE_TRUNC('week', NOW())`,
        [req.user.id]
      ),
    ]);

    res.json({
      ...statsResult.rows[0],
      monthly_valid: parseInt(monthlyResult.rows[0].count),
      weekly_valid: parseInt(weeklyResult.rows[0].count),
    });
  } catch (err) {
    console.error('GET /user/stats:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /user/referral-link
 * Returns the user's referral link + QR code URL
 */
router.get('/referral-link', requireAuth, async (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://freestudyresources.in';
  const link = `${baseUrl}/?ref=${req.user.referral_code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  res.json({ link, qrUrl, code: req.user.referral_code });
});

module.exports = router;
