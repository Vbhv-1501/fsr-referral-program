// backend/routes/leaderboard.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(apiLimiter);

/**
 * GET /leaderboard?type=monthly|weekly|all_time&page=1&limit=50
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const type = ['monthly', 'weekly', 'all_time'].includes(req.query.type)
      ? req.query.type
      : 'monthly';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const offset = (page - 1) * limit;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const orderCol =
      type === 'weekly'
        ? 'lb.weekly_referrals'
        : type === 'all_time'
        ? 'lb.all_time_referrals'
        : 'lb.monthly_referrals';

    const result = await db.query(
      `SELECT
         ROW_NUMBER() OVER (ORDER BY ${orderCol} DESC) AS rank,
         u.id, u.username, u.first_name, u.photo_url,
         lb.monthly_referrals, lb.weekly_referrals, lb.all_time_referrals,
         lb.badges
       FROM leaderboard lb
       JOIN users u ON u.id = lb.user_id
       WHERE lb.contest_month = $1
         AND u.is_banned = FALSE
         AND ${orderCol} > 0
       ORDER BY ${orderCol} DESC
       LIMIT $2 OFFSET $3`,
      [currentMonth, limit, offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM leaderboard lb
       JOIN users u ON u.id = lb.user_id
       WHERE lb.contest_month = $1 AND u.is_banned = FALSE`,
      [currentMonth]
    );

    // If user is logged in, find their rank
    let userRank = null;
    if (req.user) {
      const userRankResult = await db.query(
        `SELECT rank, ${orderCol.replace('lb.', '')} AS score
         FROM leaderboard WHERE user_id = $1 AND contest_month = $2`,
        [req.user.id, currentMonth]
      );
      userRank = userRankResult.rows[0] || null;
    }

    res.json({
      entries: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      pages: Math.ceil(countResult.rows[0].count / limit),
      type,
      userRank,
    });
  } catch (err) {
    console.error('GET /leaderboard:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /leaderboard/top10
 * Fast endpoint for homepage preview
 */
router.get('/top10', async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const result = await db.query(
      `SELECT
         ROW_NUMBER() OVER (ORDER BY lb.monthly_referrals DESC) AS rank,
         u.username, u.first_name, u.photo_url,
         lb.monthly_referrals, lb.badges
       FROM leaderboard lb
       JOIN users u ON u.id = lb.user_id
       WHERE lb.contest_month = $1
         AND u.is_banned = FALSE
         AND lb.monthly_referrals > 0
       ORDER BY lb.monthly_referrals DESC
       LIMIT 10`,
      [currentMonth]
    );
    res.json({ entries: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /leaderboard/winners
 * Previous contest winners
 */
router.get('/winners', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         w.rank_achieved, w.referrals, w.reward_amount, w.contest_month, w.announced_at,
         u.username, u.first_name, u.photo_url
       FROM winners w
       JOIN users u ON u.id = w.user_id
       ORDER BY w.announced_at DESC
       LIMIT 30`
    );
    res.json({ winners: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// ============================================================
// backend/routes/referrals.js
// ============================================================
const referralRouter = express.Router();
const referralService = require('../services/referral');
const { requireAuth } = require('../middleware/auth');
const { referralLimiter } = require('../middleware/rateLimit');

/**
 * POST /referral/track
 * Called when a new user signs up via referral link
 * (Usually handled inside auth/telegram, but exposed for manual trigger)
 */
referralRouter.post('/track', requireAuth, referralLimiter, async (req, res) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) return res.status(400).json({ error: 'referralCode required' });

    const ip = req.ip;
    const fingerprint = req.headers['x-device-fingerprint'] || null;

    const result = await referralService.trackReferral({
      referralCode: referralCode.toUpperCase(),
      newUser: req.user,
      ip,
      fingerprint,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    const status = ['INVALID_CODE', 'SELF_REFERRAL', 'DUPLICATE_REFERRAL'].includes(err.code)
      ? 400
      : 500;
    res.status(status).json({ error: err.message, code: err.code });
  }
});

module.exports = { leaderboardRouter: router, referralRouter: referralRouter };
