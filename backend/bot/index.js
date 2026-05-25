// backend/bot/index.js
// Telegram Bot using node-telegram-bot-api
const TelegramBot = require('node-telegram-bot-api');
const db = require('../db');
const referralService = require('../services/referral');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://freestudyresources.in';

let bot = null;

const start = () => {
  if (!BOT_TOKEN) {
    console.warn('[Bot] BOT_TOKEN not set — bot disabled');
    return null;
  }

  bot = new TelegramBot(BOT_TOKEN, { polling: true });

  console.log('[Bot] Telegram bot started');

  // ─── /start command ─────────────────────────────────────
  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const refCode = match?.[1]?.trim().toUpperCase();

    const user = await db.query(
      `SELECT id, first_name, referral_code FROM users WHERE telegram_id = $1`,
      [telegramId]
    );

    const firstName = msg.from.first_name || 'friend';

    const joinUrl = `https://t.me/${CHANNEL_ID.replace('@', '')}`;
    const dashboardUrl = refCode
      ? `${FRONTEND_URL}/?ref=${refCode}`
      : FRONTEND_URL;

    const welcomeText = user.rows.length
      ? `👋 Welcome back, <b>${firstName}</b>!\n\n` +
        `🔗 Your referral link:\n<code>${FRONTEND_URL}/?ref=${user.rows[0].referral_code}</code>\n\n` +
        `📊 <a href="${FRONTEND_URL}/dashboard">View your dashboard</a>`
      : `🎉 Welcome to <b>Free Study Resources</b>, ${firstName}!\n\n` +
        `Join thousands of students earning rewards by inviting friends.\n\n` +
        `✅ Step 1: Join our Telegram channel\n` +
        `✅ Step 2: Sign up on our platform\n` +
        `✅ Step 3: Share your referral link\n` +
        `✅ Step 4: Win monthly prizes!\n\n` +
        `🏆 Top prize this month: <b>₹5,000</b>`;

    await bot.sendMessage(chatId, welcomeText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📢 Join Channel', url: joinUrl },
            { text: '🚀 Sign Up & Get Link', url: dashboardUrl },
          ],
          [{ text: '🏆 View Leaderboard', url: `${FRONTEND_URL}/leaderboard` }],
        ],
      },
    });
  });

  // ─── /stats command ──────────────────────────────────────
  bot.onText(/\/stats/, async (msg) => {
    const telegramId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await db.query(
      `SELECT u.first_name, u.valid_referrals, u.pending_referrals,
              lb.rank, lb.monthly_referrals
       FROM users u
       LEFT JOIN leaderboard lb ON lb.user_id = u.id
         AND lb.contest_month = TO_CHAR(NOW(), 'YYYY-MM')
       WHERE u.telegram_id = $1`,
      [telegramId]
    );

    if (!user.rows.length) {
      return bot.sendMessage(
        chatId,
        '❌ You are not registered yet. Sign up at ' + FRONTEND_URL
      );
    }

    const u = user.rows[0];
    const text =
      `📊 <b>Your Stats</b>\n\n` +
      `✅ Valid referrals: <b>${u.valid_referrals}</b>\n` +
      `⏳ Pending: <b>${u.pending_referrals}</b>\n` +
      `🗓 This month: <b>${u.monthly_referrals || 0}</b>\n` +
      `🏆 Current rank: <b>${u.rank ? `#${u.rank}` : 'Not ranked yet'}</b>`;

    bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
  });

  // ─── /leaderboard command ────────────────────────────────
  bot.onText(/\/leaderboard/, async (msg) => {
    const chatId = msg.chat.id;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const result = await db.query(
      `SELECT u.first_name, u.username, lb.monthly_referrals,
              ROW_NUMBER() OVER (ORDER BY lb.monthly_referrals DESC) AS rank
       FROM leaderboard lb
       JOIN users u ON u.id = lb.user_id
       WHERE lb.contest_month = $1 AND lb.monthly_referrals > 0
       ORDER BY lb.monthly_referrals DESC LIMIT 10`,
      [currentMonth]
    );

    const medals = ['🥇', '🥈', '🥉'];
    const lines = result.rows.map((row, i) => {
      const medal = medals[i] || `#${i + 1}`;
      const name = row.username ? `@${row.username}` : row.first_name;
      return `${medal} ${name} — <b>${row.monthly_referrals}</b> referrals`;
    });

    const text =
      `🏆 <b>Top 10 This Month</b>\n\n` +
      (lines.join('\n') || 'No entries yet!') +
      `\n\n<a href="${FRONTEND_URL}/leaderboard">Full Leaderboard →</a>`;

    bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  });

  // ─── /help command ───────────────────────────────────────
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `📚 <b>Available Commands</b>\n\n` +
        `/start — Welcome message & your referral link\n` +
        `/stats — Your referral stats\n` +
        `/leaderboard — Top 10 this month\n` +
        `/help — This message`,
      { parse_mode: 'HTML' }
    );
  });

  // ─── Channel join event (via bot in channel) ─────────────
  // Note: Requires bot to be admin in the channel
  bot.on('chat_member', async (update) => {
    try {
      const { chat, new_chat_member, old_chat_member } = update;
      if (String(chat.id) !== String(CHANNEL_ID) && chat.username !== CHANNEL_ID.replace('@', ''))
        return;

      const telegramId = new_chat_member.user.id;
      const newStatus = new_chat_member.status;
      const oldStatus = old_chat_member.status;

      const justJoined =
        ['left', 'kicked'].includes(oldStatus) &&
        ['member', 'administrator', 'creator'].includes(newStatus);

      const justLeft =
        ['member', 'administrator', 'creator'].includes(oldStatus) &&
        ['left', 'kicked'].includes(newStatus);

      if (justJoined) {
        // Mark pending referrals for this user as valid
        const ref = await db.query(
          `UPDATE referrals
           SET status = 'valid', verified_at = NOW()
           WHERE referred_telegram_id = $1 AND status = 'pending'
           RETURNING referrer_id`,
          [telegramId]
        );

        if (ref.rows.length) {
          await db.query(`SELECT recompute_referral_counts($1)`, [ref.rows[0].referrer_id]);

          // Notify referrer
          const referrer = await db.query(
            `SELECT telegram_id, first_name FROM users WHERE id = $1`,
            [ref.rows[0].referrer_id]
          );
          if (referrer.rows.length) {
            const { telegram_id, first_name } = referrer.rows[0];
            await bot.sendMessage(
              telegram_id,
              `🎉 <b>New referral confirmed!</b>\n\nSomeone just joined the channel through your link.\n\n<a href="${FRONTEND_URL}/dashboard">Check your dashboard →</a>`,
              { parse_mode: 'HTML', disable_web_page_preview: true }
            );
          }
        }

        // Update user's channel membership flag
        await db.query(
          `UPDATE users SET is_channel_member = TRUE WHERE telegram_id = $1`,
          [telegramId]
        );
      }

      if (justLeft) {
        // Mark valid referrals as pending (user left)
        const ref = await db.query(
          `UPDATE referrals
           SET status = 'pending', verified_at = NULL
           WHERE referred_telegram_id = $1 AND status = 'valid'
           RETURNING referrer_id`,
          [telegramId]
        );

        if (ref.rows.length) {
          await db.query(`SELECT recompute_referral_counts($1)`, [ref.rows[0].referrer_id]);
        }

        await db.query(
          `UPDATE users SET is_channel_member = FALSE WHERE telegram_id = $1`,
          [telegramId]
        );
      }
    } catch (err) {
      console.error('[Bot] chat_member error:', err.message);
    }
  });

  bot.on('polling_error', (err) => {
    console.error('[Bot] Polling error:', err.message);
  });

  return bot;
};

const stop = () => {
  if (bot) {
    bot.stopPolling();
    bot = null;
  }
};

module.exports = { start, stop };
