// backend/services/referral.js
const crypto = require('crypto');
const db = require('../db');
const telegramService = require('./telegram');
const antiCheat = require('./antiCheat');

/**
 * Generate a unique referral code for a user
 */
const generateReferralCode = (telegramId) => {
  const hash = crypto
    .createHash('sha256')
    .update(`${telegramId}${Date.now()}${Math.random()}`)
    .digest('base64url')
    .slice(0, 8)
    .toUpperCase();
  return `FSR${hash}`;
};

/**
 * Track a new referral:
 * - Verify ref code exists
 * - Verify this telegram_id hasn't been referred before
 * - Run anti-cheat checks
 * - Check Telegram channel membership
 * - Insert referral as 'pending' or 'valid'
 */
const trackReferral = async ({ referralCode, newUser, ip, fingerprint }) => {
  return db.withTransaction(async (client) => {
    // 1. Find referrer
    const refResult = await client.query(
      `SELECT id, telegram_id FROM users WHERE referral_code = $1 AND is_banned = FALSE`,
      [referralCode]
    );
    if (!refResult.rows.length) {
      throw Object.assign(new Error('Invalid referral code'), { code: 'INVALID_CODE' });
    }
    const referrer = refResult.rows[0];

    // 2. Self-referral check
    if (referrer.telegram_id === newUser.telegram_id) {
      throw Object.assign(new Error('Self-referral not allowed'), { code: 'SELF_REFERRAL' });
    }

    // 3. Check duplicate (this telegram_id already counted — ever)
    const existingRef = await client.query(
      `SELECT id, status FROM referrals WHERE referred_telegram_id = $1`,
      [newUser.telegram_id]
    );
    if (existingRef.rows.length) {
      const status = existingRef.rows[0].status;
      throw Object.assign(
        new Error(`This Telegram account was already referred (status: ${status})`),
        { code: 'DUPLICATE_REFERRAL' }
      );
    }

    // 4. Anti-cheat analysis
    const fraud = await antiCheat.analyzeFraudRisk({
      referrerId: referrer.id,
      referredTelegramId: newUser.telegram_id,
      ip,
      fingerprint,
      client,
    });

    // 5. Check Telegram membership
    const isMember = await telegramService.isChannelMember(newUser.telegram_id);

    const status = fraud.isFraud
      ? 'fraud'
      : isMember
      ? 'valid'
      : 'pending';

    // 6. Insert referral
    const refInsert = await client.query(
      `INSERT INTO referrals
         (referrer_id, referred_id, referred_telegram_id, status, fraud_reason, ip_address, device_fingerprint, verified_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        referrer.id,
        newUser.id,
        newUser.telegram_id,
        status,
        fraud.isFraud ? fraud.flags.join(', ') : null,
        ip,
        fingerprint,
        isMember ? new Date() : null,
      ]
    );

    // 7. Update referrer counts
    await client.query(`SELECT recompute_referral_counts($1)`, [referrer.id]);

    // 8. Update new user's referred_by
    await client.query(`UPDATE users SET referred_by = $1 WHERE id = $2`, [
      referrer.id,
      newUser.id,
    ]);

    // 9. Update platform stats
    await client.query(
      `UPDATE platform_stats SET total_referrals = total_referrals + 1 WHERE id = 1`
    );

    // 10. Log IP
    await antiCheat.logIpAction(ip, newUser.telegram_id, 'referral');

    return {
      referral: refInsert.rows[0],
      referrerId: referrer.id,
      status,
      isMember,
      fraudFlags: fraud.flags,
    };
  });
};

/**
 * Daily verification job: check if pending referrals have joined Telegram
 * Also invalidate referrals where users left the channel
 */
const runDailyVerification = async () => {
  console.log('[Verification] Starting daily referral verification...');
  let verified = 0;
  let invalidated = 0;

  // Verify pending referrals
  const pending = await db.query(
    `SELECT r.id, r.referrer_id, r.referred_telegram_id
     FROM referrals r
     WHERE r.status = 'pending'
     ORDER BY r.created_at ASC
     LIMIT 500`
  );

  for (const ref of pending.rows) {
    const isMember = await telegramService.isChannelMember(ref.referred_telegram_id);
    if (isMember) {
      await db.query(
        `UPDATE referrals SET status = 'valid', verified_at = NOW() WHERE id = $1`,
        [ref.id]
      );
      await db.query(`SELECT recompute_referral_counts($1)`, [ref.referrer_id]);
      verified++;
    }
    // Small delay to avoid hitting Telegram rate limits
    await new Promise((r) => setTimeout(r, 100));
  }

  // Check valid referrals — if user left channel, mark as pending again
  const valid = await db.query(
    `SELECT r.id, r.referrer_id, r.referred_telegram_id
     FROM referrals r
     WHERE r.status = 'valid'
     ORDER BY RANDOM()
     LIMIT 200`
  );

  for (const ref of valid.rows) {
    const isMember = await telegramService.isChannelMember(ref.referred_telegram_id);
    if (!isMember) {
      await db.query(
        `UPDATE referrals SET status = 'pending', verified_at = NULL WHERE id = $1`,
        [ref.id]
      );
      await db.query(`SELECT recompute_referral_counts($1)`, [ref.referrer_id]);
      invalidated++;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  // Refresh leaderboard
  const currentMonth = new Date().toISOString().slice(0, 7);
  await db.query(`SELECT refresh_leaderboard($1)`, [currentMonth]);

  console.log(`[Verification] Done — verified: ${verified}, invalidated: ${invalidated}`);
  return { verified, invalidated };
};

/**
 * Get referral history for a user
 */
const getUserReferrals = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const result = await db.query(
    `SELECT
       r.id, r.status, r.created_at, r.verified_at,
       u.username, u.first_name, u.photo_url
     FROM referrals r
     JOIN users u ON u.id = r.referred_id
     WHERE r.referrer_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const countResult = await db.query(
    `SELECT COUNT(*) FROM referrals WHERE referrer_id = $1`,
    [userId]
  );

  return {
    referrals: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page,
    pages: Math.ceil(countResult.rows[0].count / limit),
  };
};

module.exports = { generateReferralCode, trackReferral, runDailyVerification, getUserReferrals };
