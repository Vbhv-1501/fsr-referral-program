// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cron = require('node-cron');
const axios = require('axios');

const db = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const { leaderboardRouter, referralRouter } = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');
const { apiLimiter } = require('./middleware/rateLimit');
const referralService = require('./services/referral');
const bot = require('./bot');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security & Middleware ───────────────────────────────────
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'https://freestudyresources.in',
      ].filter(Boolean);

      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowed.some((o) => origin.startsWith(o))) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint'],
  })
);

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Health Check ─────────────────────────────────────────
// Render uses this to verify the service is alive
app.get('/health', async (req, res) => {
  try {
    const dbResult = await db.healthCheck();
    res.json({
      status: 'ok',
      db: 'connected',
      time: dbResult.time,
      env: process.env.NODE_ENV,
    });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// ─── Platform Stats (public) ──────────────────────────────
app.get('/api/stats', apiLimiter, async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM platform_stats WHERE id = 1`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/referral', referralRouter);
app.use('/api/admin', adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (err.message?.startsWith('CORS')) {
    return res.status(403).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Cron Jobs ─────────────────────────────────────────────

// Daily verification at 3:00 AM UTC
cron.schedule('0 3 * * *', async () => {
  console.log('[Cron] Running daily referral verification...');
  try {
    await referralService.runDailyVerification();
  } catch (err) {
    console.error('[Cron] Daily verification failed:', err.message);
  }
});

// Refresh leaderboard every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    await db.query(`SELECT refresh_leaderboard($1)`, [currentMonth]);
    console.log('[Cron] Leaderboard refreshed');
  } catch (err) {
    console.error('[Cron] Leaderboard refresh failed:', err.message);
  }
});

// ─── Render Free Tier Keep-Alive ──────────────────────────
// Render's free tier spins down after 15 minutes of inactivity.
// This self-ping runs every 14 minutes to keep the server awake.
// Only runs in production (i.e., on Render). Does nothing in local dev.
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  const PING_URL = `${process.env.RENDER_EXTERNAL_URL}/health`;

  cron.schedule('*/14 * * * *', async () => {
    try {
      await axios.get(PING_URL, { timeout: 8000 });
      console.log('[Keep-Alive] Pinged successfully:', PING_URL);
    } catch (err) {
      console.warn('[Keep-Alive] Ping failed:', err.message);
    }
  });

  console.log(`✅ Keep-alive enabled — pinging ${PING_URL} every 14 minutes`);
}

// ─── Start Server ─────────────────────────────────────────
const startServer = async () => {
  try {
    await db.healthCheck();
    console.log('✅ Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    if (process.env.BOT_TOKEN) {
      bot.start();
      console.log('✅ Telegram bot started');
    }
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down gracefully');
  bot.stop();
  await db.pool.end();
  process.exit(0);
});
