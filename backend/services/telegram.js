// backend/services/telegram.js
const crypto = require('crypto');
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID; // e.g. @teamfreestudyresources or numeric ID

/**
 * Verify Telegram Login Widget data using HMAC-SHA256
 * https://core.telegram.org/widgets/login
 */
const verifyTelegramAuth = (authData) => {
  const { hash, ...data } = authData;

  // Check auth_date is not older than 1 day
  const authDate = parseInt(data.auth_date, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    throw new Error('Telegram auth data is too old');
  }

  // Build data-check-string
  const checkString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  // Secret key = SHA256(BOT_TOKEN)
  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  if (expectedHash !== hash) {
    throw new Error('Invalid Telegram auth signature');
  }

  return {
    telegram_id: parseInt(data.id, 10),
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    username: data.username || null,
    photo_url: data.photo_url || null,
  };
};

/**
 * Check if a Telegram user is currently a member of the channel
 */
const isChannelMember = async (telegramId) => {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`;
    const response = await axios.get(url, {
      params: {
        chat_id: CHANNEL_ID,
        user_id: telegramId,
      },
      timeout: 10000,
    });

    const { status } = response.data.result;
    // 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked'
    return ['creator', 'administrator', 'member', 'restricted'].includes(status);
  } catch (err) {
    console.error('isChannelMember error:', err?.response?.data || err.message);
    // If bot can't access, default to false (safe)
    return false;
  }
};

/**
 * Get Telegram channel info/member count
 */
const getChannelInfo = async () => {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChat`;
    const response = await axios.get(url, {
      params: { chat_id: CHANNEL_ID },
      timeout: 10000,
    });
    return response.data.result;
  } catch (err) {
    console.error('getChannelInfo error:', err.message);
    return null;
  }
};

/**
 * Get member count of channel
 */
const getMemberCount = async () => {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount`;
    const response = await axios.get(url, {
      params: { chat_id: CHANNEL_ID },
      timeout: 10000,
    });
    return response.data.result;
  } catch (err) {
    console.error('getMemberCount error:', err.message);
    return null;
  }
};

/**
 * Send a message to a user via bot
 */
const sendMessage = async (chatId, text, options = {}) => {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options,
    });
  } catch (err) {
    console.error('sendMessage error:', err?.response?.data || err.message);
  }
};

module.exports = {
  verifyTelegramAuth,
  isChannelMember,
  getChannelInfo,
  getMemberCount,
  sendMessage,
};
