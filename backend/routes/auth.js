// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const telegramService = require('../services/telegram');
const referralService = require('../services/referral');
const antiCheat = require('../services/antiCheat');
const { generateTokens } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /auth/telegram
 * Handle Telegram Login Widget callback
 */
router.post('/telegram', authLimiter, async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const fingerprint = req.headers['x-device-fingerprint'] || null;
    const { ref } = req.query; // referral code from URL

    // Validate and verify Telegram auth data
    const telegramData = telegramService.verifyTelegramAuth(req.body);

    // Log IP action
    await antiCheat.logIpAction(ip, telegramData.telegram_id, 'login');

    // Upsert user
    const result = await db.query(
      `INSERT INTO users (telegram_id, username, first_name, last_name, photo_url, referral_code, ip_address, device_fingerprint)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (telegram_id) DO UPDATE SET
         username = EXCLUDED.username,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         photo_url = EXCLUDED.photo_url,
         ip_address = EXCLUDED.ip_address,
         updated_at = NOW()
       RETURNING *`,
      [
        telegramData.telegram_id,
        telegramData.username,
        telegramData.first_name,
        telegramData.last_name,
        telegramData.photo_url,
        referralService.generateReferralCode(telegramData.telegram_id),
        ip,
        fingerprint,
      ]
    );

    const user = result.rows[0];
    const isNewUser = result.rows[0].created_at === result.rows[0].updated_at;

    // Update platform stats for new users
    if (isNewUser) {
      await db.query(
        `UPDATE platform_stats SET total_users = total_users + 1 WHERE id = 1`
      );
    }

    // Process referral if ref code present and this is effectively a new registration
    let referralResult = null;
    if (ref && isNewUser) {
      try {
        referralResult = await referralService.trackReferral({
          referralCode: ref.toUpperCase(),
          newUser: user,
          ip,
          fingerprint,
        });
      } catch (refErr) {
        // Log but don't fail login
        console.warn('Referral tracking failed:', refErr.message);
        referralResult = { error: refErr.message, code: refErr.code };
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.query(
      `INSERT INTO sessions (user_id, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshToken, ip, req.headers['user-agent'], expiresAt]
    );

    // Scrub sensitive fields
    const { ip_address, device_fingerprint, ...safeUser } = user;

    res.json({
      user: safeUser,
      accessToken,
      refreshToken,
      referral: referralResult,
    });
  } catch (err) {
    console.error('POST /auth/telegram error:', err.message);
    const status = err.message.includes('signature') || err.message.includes('old') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * POST /auth/refresh
 * Exchange refresh token for new access token
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (payload.type !== 'refresh') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Check session exists and not expired
    const session = await db.query(
      `SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()`,
      [refreshToken]
    );

    if (!session.rows.length) {
      return res.status(401).json({ error: 'Session expired or revoked' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload.sub);

    // Rotate refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.query(
      `UPDATE sessions SET refresh_token = $1, expires_at = $2 WHERE refresh_token = $3`,
      [newRefreshToken, expiresAt, refreshToken]
    );

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * POST /auth/logout
 */
router.post('/logout', requireAuth, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await db.query(`DELETE FROM sessions WHERE refresh_token = $1`, [refreshToken]);
  }
  res.json({ success: true });
});

/**
 * GET /auth/me
 * Return current user
 */
router.get('/me', requireAuth, (req, res) => {
  const { ip_address, device_fingerprint, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

module.exports = router;
