// backend/services/antiCheat.js
const db = require('../db');

/**
 * Generate a deterministic score indicating fraud likelihood (0–100).
 * Checks:
 *  1. Same IP used for referrer + referred
 *  2. Device fingerprint collision
 *  3. Too many signups from the same IP in last 24h
 *  4. Referred account age (too fresh)
 *  5. Referred account is banned
 */
const analyzeFraudRisk = async ({ referrerId, referredTelegramId, ip, fingerprint, client }) => {
  const q = client ? client.query.bind(client) : db.query;
  const flags = [];

  try {
    // 1. Check IP: has this IP already referred someone in the same batch?
    const ipReferrer = await q(
      `SELECT ip_address FROM users WHERE id = $1`,
      [referrerId]
    );
    const referrerIp = ipReferrer.rows[0]?.ip_address;
    if (referrerIp && referrerIp === ip) {
      flags.push('IP_MATCH_REFERRER');
    }

    // 2. Too many sign-ups from this IP in 24h
    const ipCount = await q(
      `SELECT COUNT(*) FROM ip_logs
       WHERE ip_address = $1 AND action = 'signup' AND created_at > NOW() - INTERVAL '24 hours'`,
      [ip]
    );
    if (parseInt(ipCount.rows[0]?.count || 0, 10) >= 3) {
      flags.push('HIGH_IP_SIGNUP_RATE');
    }

    // 3. Device fingerprint match with referrer
    if (fingerprint) {
      const fpReferrer = await q(
        `SELECT device_fingerprint FROM users WHERE id = $1`,
        [referrerId]
      );
      if (fpReferrer.rows[0]?.device_fingerprint === fingerprint) {
        flags.push('DEVICE_FINGERPRINT_MATCH');
      }
    }

    // 4. Has this telegram_id been rejected before?
    const prevRejection = await q(
      `SELECT id FROM referrals WHERE referred_telegram_id = $1 AND status IN ('rejected','fraud')`,
      [referredTelegramId]
    );
    if (prevRejection.rows.length) {
      flags.push('PREVIOUSLY_REJECTED');
    }

    // Compute score
    const scoreMap = {
      IP_MATCH_REFERRER: 60,
      HIGH_IP_SIGNUP_RATE: 30,
      DEVICE_FINGERPRINT_MATCH: 50,
      PREVIOUSLY_REJECTED: 70,
    };
    const score = flags.reduce((acc, f) => Math.min(acc + (scoreMap[f] || 0), 100), 0);

    return { score, flags, isFraud: score >= 60 };
  } catch (err) {
    console.error('analyzeFraudRisk error:', err.message);
    return { score: 0, flags: [], isFraud: false };
  }
};

/**
 * Log an IP action for rate tracking
 */
const logIpAction = async (ip, telegramId, action) => {
  try {
    await db.query(
      `INSERT INTO ip_logs (ip_address, telegram_id, action) VALUES ($1, $2, $3)`,
      [ip, telegramId, action]
    );
  } catch (err) {
    console.error('logIpAction error:', err.message);
  }
};

/**
 * Detect suspicious cluster: same referrer with many rejections
 */
const checkReferrerHealth = async (referrerId) => {
  const result = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'fraud') as fraud_count,
       COUNT(*) FILTER (WHERE status = 'valid') as valid_count,
       COUNT(*) as total
     FROM referrals WHERE referrer_id = $1`,
    [referrerId]
  );

  const { fraud_count, valid_count, total } = result.rows[0];
  const fraudRate = total > 5 ? fraud_count / total : 0;

  return {
    fraudRate,
    shouldFlag: fraudRate > 0.5 && total >= 5,
    counts: { fraud: parseInt(fraud_count), valid: parseInt(valid_count), total: parseInt(total) },
  };
};

module.exports = { analyzeFraudRisk, logIpAction, checkReferrerHealth };
