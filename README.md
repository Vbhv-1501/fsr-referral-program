# Free Study Resources — Referral Platform

A production-ready, gamified Telegram referral tracking platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or free Neon.tech account)
- Telegram Bot (already configured)

---

## 📁 Project Structure

```
FSR TG REFER/
├── backend/          ← Node.js + Express + Prisma API
└── frontend/         ← Next.js 14 + TypeScript + Tailwind
```

---

## 🗄️ Database Setup (Neon — Free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project → Copy the **Connection String**
3. Paste it into `backend/.env` as `DATABASE_URL` and `DIRECT_URL`
4. Run migrations:

```bash
cd backend
npx prisma db push
```

---

## ⚙️ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup env
# Edit .env with your Neon DATABASE_URL
# BOT_TOKEN and TELEGRAM_CHANNEL_ID are already set

# Push DB schema
npx prisma db push

# Run dev server
npm run dev
```

Backend runs on: `http://localhost:4000`

---

## 🎨 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup env
# Edit .env.local and update social media URLs

# Run dev server
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## 🌐 Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables from `frontend/.env.local`
4. Deploy!

### Backend → Railway

1. Push backend folder to GitHub
2. Create new service on [railway.app](https://railway.app)
3. Add environment variables from `backend/.env`
4. Set start command: `npm start`

---

## 🤖 Telegram Bot Setup

Your bot is already configured:
- **Bot Token**: `8893853352:AAHKtfrm8cARJZJl5uA2ZXW5gWdGAyTYwEk`
- **Channel ID**: `-1002297542130`

**IMPORTANT**: Make your bot an **admin** of the Telegram channel so it can verify memberships via `getChatMember`.

Steps:
1. Open [@teamfreestudyresources](https://t.me/teamfreestudyresources) in Telegram
2. Go to Channel Settings → Administrators
3. Add your bot as an admin with at least "Read Messages" permission

---

## 🔐 Make First Admin

After creating your account, run this in your database:

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your@email.com';
-- OR for Telegram users:
UPDATE "User" SET "isAdmin" = true WHERE "telegramUsername" = 'yourusername';
```

Then access: `http://localhost:3000/admin`

---

## 📱 Social Media Links

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/YOUR_HANDLE
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@YOUR_CHANNEL
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/YOUR_NUMBER
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/YOUR_HANDLE
NEXT_PUBLIC_DISCORD_URL=https://discord.gg/YOUR_SERVER
```

---

## 🏆 Monthly Contest Management

To reset monthly contest (via Admin Panel):
1. Go to `/admin`
2. Click **"Monthly Reset"** button
3. Winners are auto-snapshotted with prizes

Or via API:
```
POST /admin/reset-monthly
Authorization: Bearer <admin-token>
```

---

## 🔧 Environment Variables

### Backend `.env`
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `DIRECT_URL` | Same as DATABASE_URL for Neon |
| `JWT_SECRET` | Random secret for JWT signing |
| `BOT_TOKEN` | Telegram bot token |
| `TELEGRAM_CHANNEL_ID` | Numeric channel ID |
| `PORT` | Server port (default 4000) |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend `.env.local`
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_TELEGRAM_BOT_NAME` | Bot username (without @) |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL` | Channel invite link |
| `NEXT_PUBLIC_*_URL` | Social media URLs |

---

## 📊 Features

- ✅ Telegram Widget Login
- ✅ Email + Password Registration with Telegram username
- ✅ Unique referral link + QR code
- ✅ Real-time Telegram membership verification
- ✅ Anti-cheat: Telegram ID locking, IP flood detection
- ✅ Daily cron: Re-verify all referrals, catch channel leavers
- ✅ Live leaderboard (monthly/weekly/all-time)
- ✅ Rank badges (Gold, Silver, Bronze, etc.)
- ✅ Admin panel: users, referrals, analytics, monthly reset
- ✅ Winner showcase (past monthly winners)
- ✅ Premium UI with Three.js particles, GSAP, Framer Motion
- ✅ Mobile-first responsive design
- ✅ SEO optimized
