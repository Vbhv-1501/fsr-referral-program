// backend/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redis = require('ioredis');

let redisClient = null;

// Try to connect to Redis; fallback to in-memory if unavailable
try {
  if (process.env.REDIS_URL) {
    redisClient = new redis(process.env.REDIS_URL, {
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    redisClient.on('error', () => {
      redisClient = null;
    });
  }
} catch (_) {
  redisClient = null;
}

const makeStore = () => {
  if (redisClient) {
    return new RedisStore({ sendCommand: (...args) => redisClient.call(...args) });
  }
  return undefined; // memory store
};

/** General API: 100 requests / 15 min */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { error: 'Too many requests, please try again later.' },
});

/** Auth endpoints: 10 requests / 15 min */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { error: 'Too many login attempts. Please wait before trying again.' },
});

/** Referral tracking: 20 requests / hour */
const referralLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { error: 'Too many referral attempts.' },
});

/** Admin: 200 requests / 15 min */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { error: 'Admin rate limit exceeded.' },
});

module.exports = { apiLimiter, authLimiter, referralLimiter, adminLimiter };
