# 🎓 Free Study Resources — Referral & Community Growth Platform

A production-grade, gamified Telegram referral tracking platform that motivates students to invite friends to the **Free Study Resources** Telegram channel, compete on a live leaderboard, and win monthly cash prizes.

---

## 📸 Platform Overview

| Page | Description |
|------|-------------|
| **Homepage** | Hero, live stats, how-it-works, leaderboard preview, rewards, FAQ |
| **Dashboard** | Personal referral link, QR code, stats, rank progress, referral history |
| **Leaderboard** | Monthly / Weekly / All-Time rankings with real-time updates |
| **Winners** | Hall of fame — previous contest winners and their rewards |
| **Admin Panel** | User management, referral approval, fraud detection, analytics, contest controls |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│           Next.js 14 · Tailwind CSS · Framer Motion         │
│                    Deployed on Vercel                        │
└─────────────────────┬───────────────────────────────────────┘
                      │  REST API (JSON)
┌─────────────────────▼───────────────────────────────────────┐
│                        BACKEND                              │
│              Node.js · Express.js · JWT Auth                │
│                    Deployed on Railway                       │
├──────────────────────────────────┬──────────────────────────┤
│         PostgreSQL (DB)          │    Telegram Bot API      │
│      Supabase / Railway PG       │   getChatMember, etc.    │
└──────────────────────────────────┴──────────────────────────┘
```

### Key Design Decisions

- **Telegram ID as primary identity** — Never username. IDs are immutable; usernames change.
- **One referral per Telegram account, forever** — Enforced by a `UNIQUE` constraint on `referred_telegram_id`.
- **Rejoin abuse prevention** — If a referred user leaves and rejoins the channel, their referral status reverts to `pending`; the referrer's count does NOT increase again.
- **Pre-computed leaderboard** — A dedicated `leaderboard` table is refreshed every 30 minutes via a cron job (PostgreSQL function `refresh_leaderboard()`), ensuring `/leaderboard` API is always O(1) regardless of user count.
- **Anti-cheat at write time** — Every referral is scored for fraud risk (IP match, device fingerprint, signup rate) before being committed to the database.

---

## 📁 Project Structure

```
fsr-platform/
├── backend/
│   ├── server.js               # Express app, cron jobs, startup
│   ├── db/
│   │   ├── index.js            # pg Pool, withTransaction helper
│   │   └── schema.sql          # Full PostgreSQL schema + functions
│   ├── middleware/
│   │   ├── auth.js             # JWT verify, requireAuth, requireAdmin
│   │   └── rateLimit.js        # express-rate-limit configs
│   ├── routes/
│   │   ├── auth.js             # POST /auth/telegram, /refresh, /logout
│   │   ├── users.js            # GET /user/profile, /referrals, /stats
│   │   ├── leaderboard.js      # GET /leaderboard, /top10, /winners
│   │   │                       # POST /referral/track
│   │   └── admin.js            # Full admin CRUD + analytics
│   ├── services/
│   │   ├── telegram.js         # verifyTelegramAuth, isChannelMember
│   │   ├── referral.js         # trackReferral, runDailyVerification
│   │   └── antiCheat.js        # analyzeFraudRisk, logIpAction
│   ├── bot/
│   │   └── index.js            # Telegram bot: /start, /stats, join events
│   ├── Dockerfile
│   ├── railway.toml
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── pages/
│   │   ├── index.jsx           # Homepage (all sections)
│   │   ├── dashboard.jsx       # User dashboard
│   │   ├── leaderboard.jsx     # Full leaderboard page
│   │   ├── winners.jsx         # Hall of fame
│   │   ├── auth/callback.jsx   # Telegram OAuth redirect handler
│   │   ├── admin/index.jsx     # Admin panel
│   │   ├── 404.jsx
│   │   ├── _app.jsx
│   │   └── _document.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx            # Animated hero with particle canvas
│   │   ├── Sections.jsx        # LiveStats, HowItWorks, Rewards, FAQ
│   │   ├── LeaderboardPreview.jsx
│   │   └── TelegramLogin.jsx   # Widget + JoinSection
│   ├── lib/
│   │   ├── api.js              # Axios client + all API methods
│   │   ├── store.js            # Zustand auth store (persist)
│   │   └── fingerprint.js      # Browser fingerprint for anti-cheat
│   ├── styles/globals.css
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── Dockerfile
│   ├── vercel.json
│   └── .env.example
│
├── docker-compose.yml          # Full local stack (PG + Redis + BE + FE)
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 18.x |
| npm | 9.x |
| PostgreSQL | 14.x |
| A Telegram Bot Token | — (from [@BotFather](https://t.me/BotFather)) |

---

## 🚀 Local Development Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourorg/fsr-referral-platform.git
cd fsr-referral-platform
```

### 2. Configure environment variables

**Backend:**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://fsr_user:fsr_password@localhost:5432/fsr_referral_db
JWT_SECRET=your_32_char_secret_minimum_here_xyz
BOT_TOKEN=1234567890:AABBCCDDeeffGGhhIIjjKKllMMnnOOppQQ
TELEGRAM_CHANNEL_ID=@teamfreestudyresources
ADMIN_TELEGRAM_IDS=123456789
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=4000
```

**Frontend:**

```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_BOT_NAME=YourBotUsername
NEXT_PUBLIC_ADMIN_TELEGRAM_IDS=123456789
```

### 3a. Start with Docker Compose (recommended)

```bash
# Create a root .env for docker-compose variable substitution
cat > .env <<EOF
BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_ID=@teamfreestudyresources
ADMIN_TELEGRAM_IDS=123456789
BOT_NAME=YourBotUsername
EOF

docker compose up --build
```

Services will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### 3b. Start manually (without Docker)

**Set up PostgreSQL:**

```bash
createdb fsr_referral_db
psql fsr_referral_db < backend/db/schema.sql
```

**Start the backend:**

```bash
cd backend
npm install
npm run dev        # Uses nodemon for hot reload
```

**Start the frontend:**

```bash
cd frontend
npm install
npm run dev        # Runs on http://localhost:3000
```

---

## 🤖 Telegram Bot Setup

### Step 1 — Create your bot

1. Open [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the prompts
3. Copy the **Bot Token** → paste into `backend/.env` as `BOT_TOKEN`
4. Copy the **Bot Username** → paste into `frontend/.env.local` as `NEXT_PUBLIC_BOT_NAME`

### Step 2 — Configure the Login Widget

In BotFather:
```
/setdomain → Your bot → your-frontend-domain.vercel.app
```

This whitelists your domain for the Telegram Login Widget.

### Step 3 — Add bot to your channel

1. Open your Telegram channel settings
2. Go to **Administrators** → **Add Administrator**
3. Search for your bot's username
4. Grant these permissions:
   - ✅ Read messages
   - ✅ Invite users via link
5. Copy your channel's ID or username → set `TELEGRAM_CHANNEL_ID` in `.env`

> **Getting the numeric channel ID:** Forward a message from your channel to [@userinfobot](https://t.me/userinfobot). It will show the chat ID (it will be negative for channels, e.g. `-1001234567890`).

### Step 4 — Enable chat_member updates (for real-time join detection)

The bot receives `chat_member` events when users join/leave only if it's an admin in the channel. Once added as admin, join/leave events fire automatically and referrals are confirmed in real-time.

---

## 🌐 Production Deployment

### Backend → Railway

1. Create a new project at [railway.app](https://railway.app)
2. Add a **PostgreSQL** plugin — Railway will inject `DATABASE_URL` automatically
3. Add a **Redis** plugin (optional) — for distributed rate limiting
4. Connect your GitHub repo and point to the `backend/` directory
5. Set environment variables in the Railway dashboard:

```
JWT_SECRET=<generated secret>
BOT_TOKEN=<your bot token>
TELEGRAM_CHANNEL_ID=@teamfreestudyresources
ADMIN_TELEGRAM_IDS=<your telegram id>
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

6. After first deploy, run the schema migration:

```bash
# Via Railway CLI
railway run npm run db:migrate
```

Or connect to the Railway PG instance and run `schema.sql` manually.

### Frontend → Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `frontend`
3. Set **Framework Preset** to `Next.js`
4. Add environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_BOT_NAME=YourBotUsername
NEXT_PUBLIC_ADMIN_TELEGRAM_IDS=123456789
```

5. Deploy.

> **Region tip:** Select `bom1` (Mumbai) in `vercel.json` for lowest latency from India.

---

## 🗄 Database Reference

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | All registered users, referral code, counts, ban status |
| `referrals` | Every referral relationship — status, fraud reason, IP |
| `leaderboard` | Pre-computed monthly/weekly/all-time rankings |
| `rewards` | Reward records tied to winners |
| `winners` | Historical hall of fame |
| `ip_logs` | IP + action audit log for anti-cheat |
| `sessions` | Refresh token store |
| `platform_stats` | Single-row live counter cache |

### Key Constraints

```sql
-- Prevents any Telegram account from being referred more than once, ever
UNIQUE(referred_telegram_id)  -- on referrals table

-- Prevents duplicate referral codes
UNIQUE(referral_code)         -- on users table

-- Prevents duplicate leaderboard entries per user per month
UNIQUE(user_id, contest_month) -- on leaderboard table
```

### Useful Queries

```sql
-- Get full leaderboard for current month
SELECT u.username, lb.rank, lb.monthly_referrals
FROM leaderboard lb
JOIN users u ON u.id = lb.user_id
WHERE lb.contest_month = TO_CHAR(NOW(), 'YYYY-MM')
ORDER BY lb.rank ASC;

-- Manually refresh leaderboard
SELECT refresh_leaderboard(TO_CHAR(NOW(), 'YYYY-MM'));

-- Recompute a single user's counts
SELECT recompute_referral_counts('user-uuid-here');

-- Find fraud-flagged referrals in last 7 days
SELECT r.*, u.username
FROM referrals r
JOIN users u ON u.id = r.referrer_id
WHERE r.status = 'fraud'
  AND r.created_at > NOW() - INTERVAL '7 days';
```

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User clicks "Login with Telegram" widget
2. Telegram sends signed auth data (hash + auth_date + user info)
3. Backend verifies HMAC-SHA256 signature using BOT_TOKEN
4. Backend checks auth_date is not older than 24 hours
5. User is upserted into DB
6. Backend returns: { accessToken (15m), refreshToken (30d) }
7. Frontend stores tokens, attaches Bearer to all API requests
8. On 401 TOKEN_EXPIRED → frontend silently refreshes using refreshToken
9. Refresh tokens are rotated on every use
```

### Anti-Cheat Signals

| Signal | Weight | Description |
|--------|--------|-------------|
| IP match (referrer = referred) | 60 pts | Same IP signed up and referred |
| High IP signup rate | 30 pts | 3+ signups from same IP in 24h |
| Device fingerprint match | 50 pts | Same browser/device as referrer |
| Previously rejected account | 70 pts | This Telegram account was rejected before |

> **Fraud threshold:** Score ≥ 60 → referral auto-marked as `fraud`. Admins can manually override.

### Rate Limits

| Endpoint group | Limit |
|----------------|-------|
| Auth (login/refresh) | 10 req / 15 min |
| General API | 100 req / 15 min |
| Referral tracking | 20 req / hour |
| Admin panel | 200 req / 15 min |

---

## 📊 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/telegram` | — | Login with Telegram widget data |
| `POST` | `/api/auth/refresh` | — | Exchange refresh token for new access token |
| `POST` | `/api/auth/logout` | ✅ | Revoke current session |
| `GET` | `/api/auth/me` | ✅ | Get current user |

### User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/user/profile` | ✅ | Full profile with rank data |
| `GET` | `/api/user/referrals` | ✅ | Paginated referral history |
| `GET` | `/api/user/stats` | ✅ | Referral counts (monthly, weekly, all-time) |
| `GET` | `/api/user/referral-link` | ✅ | Referral link + QR code URL |

### Public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/stats` | — | Platform-wide live stats |
| `GET` | `/api/leaderboard` | Optional | Paginated leaderboard with filters |
| `GET` | `/api/leaderboard/top10` | — | Top 10 for homepage widget |
| `GET` | `/api/leaderboard/winners` | — | Historical winners |
| `POST` | `/api/referral/track` | ✅ | Manually track a referral |

### Admin (requires Telegram ID in `ADMIN_TELEGRAM_IDS`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Analytics + growth chart data |
| `GET` | `/api/admin/users` | Search / filter users |
| `POST` | `/api/admin/users/:id/ban` | Ban a user |
| `POST` | `/api/admin/users/:id/unban` | Unban a user |
| `POST` | `/api/admin/users/:id/reset-referrals` | Reset all referrals for user |
| `GET` | `/api/admin/referrals` | Browse all referrals with status filter |
| `POST` | `/api/admin/referrals/:id/approve` | Manually approve a referral |
| `POST` | `/api/admin/referrals/:id/reject` | Manually reject a referral |
| `POST` | `/api/admin/contest/reset` | End month, pick winners, log rewards |
| `POST` | `/api/admin/verify/run` | Manually trigger verification job |
| `GET` | `/api/admin/stats/platform` | Platform stats + Telegram member count |

---

## ⏰ Automated Jobs (Cron)

| Job | Schedule | Description |
|-----|----------|-------------|
| Daily verification | `0 3 * * *` (3 AM UTC) | Checks pending referrals for Telegram membership. Invalidates referrals where users left the channel. |
| Leaderboard refresh | `*/30 * * * *` (every 30 min) | Recomputes and re-ranks the leaderboard table for the current month. |

---

## 🏆 Contest Lifecycle

```
Month Start
    │
    ▼
Users refer friends → Telegram bot detects joins → Referrals verified
    │
    ▼  (runs continuously)
Leaderboard refreshed every 30 minutes
    │
    ▼
Month End → Admin clicks "End Contest"
    │         ↳ Top 3 selected from leaderboard
    │         ↳ Inserted into winners table
    │         ↳ Reward records created
    │         ↳ Platform stats updated
    ▼
Winners announced on Telegram channel
Rewards distributed within 72 hours (manual UPI/bank transfer)
    │
    ▼
Next Month Begins → New contest starts automatically
```

---

## 🎨 Design System

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-yellow` | `#E6B800` | Primary actions, highlights, rank numbers |
| `brand-yellow-light` | `#FFD700` | Hover states |
| `brand-black` | `#0A0A0A` | Page background |
| `brand-black-card` | `#161616` | Card backgrounds |
| `brand-border` | `#222222` | All borders |
| `brand-white` | `#FAFAFA` | Primary text |
| `brand-white-muted` | `#A0A0A0` | Secondary text, labels |

### Typography

| Font | Role |
|------|------|
| Space Grotesk | Headlines, card titles, numbers |
| DM Sans | Body text, descriptions |
| JetBrains Mono | Code, referral codes, status badges |

---

## 🧪 Testing Checklist

Before going to production, verify:

- [ ] Telegram Login Widget works on your domain
- [ ] `TELEGRAM_CHANNEL_ID` is correct (test `isChannelMember` returns `true` for a known member)
- [ ] Bot is admin in the channel with correct permissions
- [ ] `auth_date` check rejects stale tokens
- [ ] Self-referral returns 400 with `SELF_REFERRAL` code
- [ ] Duplicate referral returns 400 with `DUPLICATE_REFERRAL` code
- [ ] Fraud score correctly flags same-IP referrals
- [ ] Daily verification cron runs without error
- [ ] Leaderboard refresh cron updates ranks correctly
- [ ] Admin panel protected — non-admin IDs return 403
- [ ] Refresh token rotation works (old token invalidated after use)
- [ ] Rate limits trigger correctly on auth endpoints

---

## 🛠 Troubleshooting

### "Invalid Telegram auth signature"
- Your `BOT_TOKEN` is wrong or mistyped.
- Make sure there are no extra spaces or newlines in the env var.
- The `data-telegram-login` attribute in the widget must match your bot's **exact** username.

### Referrals stuck as "pending"
- The referred user hasn't joined the channel yet — that's expected.
- If they have joined: check `BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, and that the bot is an admin in the channel.
- Run `POST /api/admin/verify/run` manually to trigger an immediate check.

### "User not found or banned"
- The JWT `sub` points to a user ID that no longer exists.
- Clear `localStorage` and re-login.

### Leaderboard showing stale data
- The cron runs every 30 min. Force a refresh: `POST /api/admin/verify/run`.
- Or call `SELECT refresh_leaderboard('YYYY-MM')` directly in psql.

### Bot not receiving join events
- Confirm the bot is an **administrator** in the channel (not just a member).
- The `chat_member` update type must be enabled — it is enabled by default for bots that are admins.

---

## 📈 Scaling Considerations

| Concern | Solution |
|---------|---------|
| High concurrent reads on leaderboard | Pre-computed `leaderboard` table; add Redis cache for top10 at 5min TTL |
| Telegram API rate limits | Built-in 100ms delay between member checks in verification job |
| DB connection exhaustion | `pg` pool capped at 20 connections; Railway PG supports connection pooling via PgBouncer |
| Bot polling vs webhook | Switch to webhook mode (`bot.setWebHook(url)`) in production for lower latency |
| 50,000+ users | PostgreSQL handles this comfortably; add read replicas if leaderboard queries slow down |

---

## 📜 License

MIT — Free to use, fork, and build on.

---

## 💬 Support

- Telegram: [@teamfreestudyresources](https://t.me/teamfreestudyresources)
- Email: support@freestudyresources.in

---

*Built with care for the Free Study Resources community. Go win that leaderboard. 🏆*
