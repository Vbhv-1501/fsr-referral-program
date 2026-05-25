// Central config for all social links and platform constants
// Update these values with your actual social media URLs

export const SOCIAL_LINKS = {
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/teamfreestudyresources',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/freestudyresources',
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com/@freestudyresources',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/919999999999',
  twitter: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/freestudyres',
  discord: process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/freestudyresources',
};

export const PLATFORM_CONFIG = {
  name: 'Free Study Resources',
  shortName: 'FSR',
  tagline: 'India\'s Fastest Growing Free Learning Community',
  telegramChannel: 'https://t.me/teamfreestudyresources',
  telegramChannelId: '-1002297542130',
  botName: process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'freestudyresourcesbot',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

export const PRIZE_STRUCTURE = [
  { rank: 1, label: '🥇 Rank 1', amount: 5000 },
  { rank: 2, label: '🥈 Rank 2', amount: 2000 },
  { rank: 3, label: '🥉 Rank 3', amount: 1000 },
  { rank: 4, label: '🏅 Rank 4', amount: 500 },
  { rank: 5, label: '🏅 Rank 5', amount: 500 },
  { rank: 6, label: '🎖️ Rank 6–10', amount: 300 },
];

export const FAQ_DATA = [
  {
    q: 'How do referrals work?',
    a: 'Share your unique referral link. When someone clicks your link, signs up on this platform, AND joins our Telegram channel, you earn 1 verified referral.',
  },
  {
    q: 'When are rewards distributed?',
    a: 'Rewards are distributed within 7 days after the month ends. Winners are announced on our Telegram channel and this website.',
  },
  {
    q: 'Can the same person count as my referral twice?',
    a: 'No. Each Telegram account can only be counted as a referral once — forever. Even if they leave and rejoin, it only counts once.',
  },
  {
    q: 'What happens if my referral leaves the Telegram channel?',
    a: 'Our system checks daily. If someone you referred leaves the channel, that referral becomes invalid and your count decreases.',
  },
  {
    q: 'Can I use multiple accounts to fake referrals?',
    a: 'Absolutely not. We track Telegram IDs, IP addresses, and device fingerprints. Fake referrals are automatically detected and rejected. Accounts found cheating are permanently banned.',
  },
  {
    q: 'Is there a minimum number of referrals to win?',
    a: 'No minimum — but only the top 10 earn cash prizes. Everyone with verified referrals appears on the leaderboard.',
  },
];
