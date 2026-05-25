// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '15m';
const REFRESH_EXPIRY = '30d';

/**
 * Generate access + refresh token pair
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ sub: userId, type: 'access' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
  const refreshToken = jwt.sign({ sub: userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });
  return { accessToken, refreshToken };
};

/**
 * Middleware: require authenticated user
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);

    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const result = await db.query(
      'SELECT * FROM users WHERE id = $1 AND is_banned = FALSE',
      [payload.sub]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: 'User not found or banned' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware: require admin role
 */
const requireAdmin = (req, res, next) => {
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(Number);
  if (!adminIds.includes(Number(req.user.telegram_id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * Optional auth — attach user if token present, but don't fail
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);

    const result = await db.query(
      'SELECT * FROM users WHERE id = $1 AND is_banned = FALSE',
      [payload.sub]
    );
    if (result.rows.length) req.user = result.rows[0];
  } catch (_) {
    // silently ignore
  }
  next();
};

module.exports = { requireAuth, requireAdmin, optionalAuth, generateTokens };
