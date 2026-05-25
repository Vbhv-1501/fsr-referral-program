-- ============================================================
-- FREE STUDY RESOURCES — Referral Platform Database Schema
-- PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id       BIGINT UNIQUE NOT NULL,
  username          TEXT,
  first_name        TEXT,
  last_name         TEXT,
  photo_url         TEXT,
  referral_code     TEXT UNIQUE NOT NULL,
  referred_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  referrals_count   INTEGER NOT NULL DEFAULT 0,
  valid_referrals   INTEGER NOT NULL DEFAULT 0,
  pending_referrals INTEGER NOT NULL DEFAULT 0,
  rejected_referrals INTEGER NOT NULL DEFAULT 0,
  is_channel_member BOOLEAN NOT NULL DEFAULT FALSE,
  is_banned         BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason        TEXT,
  last_verified_at  TIMESTAMPTZ,
  ip_address        INET,
  device_fingerprint TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_users_valid_referrals ON users(valid_referrals DESC);

-- ============================================================
-- REFERRALS TABLE
-- ============================================================
CREATE TYPE referral_status AS ENUM ('pending', 'valid', 'rejected', 'fraud');

CREATE TABLE IF NOT EXISTS referrals (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_telegram_id  BIGINT NOT NULL,
  status                referral_status NOT NULL DEFAULT 'pending',
  fraud_reason          TEXT,
  ip_address            INET,
  device_fingerprint    TEXT,
  verified_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referred_telegram_id)  -- 1 referral per Telegram account, forever
);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_telegram_id ON referrals(referred_telegram_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_created_at ON referrals(created_at DESC);

-- ============================================================
-- LEADERBOARD TABLE (pre-computed for speed)
-- ============================================================
CREATE TABLE IF NOT EXISTS leaderboard (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank              INTEGER,
  monthly_referrals INTEGER NOT NULL DEFAULT 0,
  weekly_referrals  INTEGER NOT NULL DEFAULT 0,
  all_time_referrals INTEGER NOT NULL DEFAULT 0,
  contest_month     TEXT NOT NULL,  -- e.g. '2025-06'
  badges            TEXT[] DEFAULT '{}',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, contest_month)
);

CREATE INDEX idx_leaderboard_contest_month ON leaderboard(contest_month);
CREATE INDEX idx_leaderboard_monthly_rank ON leaderboard(contest_month, monthly_referrals DESC);

-- ============================================================
-- REWARDS TABLE
-- ============================================================
CREATE TYPE reward_status AS ENUM ('pending', 'approved', 'distributed', 'cancelled');

CREATE TABLE IF NOT EXISTS rewards (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank_achieved INTEGER NOT NULL,
  reward_amount INTEGER NOT NULL,
  reward_month  TEXT NOT NULL,
  status        reward_status NOT NULL DEFAULT 'pending',
  distributed_at TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_rewards_reward_month ON rewards(reward_month);

-- ============================================================
-- IP_LOGS TABLE (anti-cheat)
-- ============================================================
CREATE TABLE IF NOT EXISTS ip_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address    INET NOT NULL,
  telegram_id   BIGINT NOT NULL,
  action        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ip_logs_ip_address ON ip_logs(ip_address);
CREATE INDEX idx_ip_logs_telegram_id ON ip_logs(telegram_id);
CREATE INDEX idx_ip_logs_created_at ON ip_logs(created_at DESC);

-- ============================================================
-- WINNERS TABLE (historical)
-- ============================================================
CREATE TABLE IF NOT EXISTS winners (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank_achieved INTEGER NOT NULL,
  referrals     INTEGER NOT NULL,
  reward_amount INTEGER NOT NULL,
  contest_month TEXT NOT NULL,
  announced_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PLATFORM_STATS TABLE (live counters cache)
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_stats (
  id                    INTEGER PRIMARY KEY DEFAULT 1,
  total_users           INTEGER NOT NULL DEFAULT 0,
  total_referrals       INTEGER NOT NULL DEFAULT 0,
  total_rewards_dist    INTEGER NOT NULL DEFAULT 0,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO platform_stats DEFAULT VALUES ON CONFLICT DO NOTHING;

-- ============================================================
-- SESSIONS TABLE (refresh token management)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT UNIQUE NOT NULL,
  ip_address    INET,
  user_agent    TEXT,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);

-- ============================================================
-- FUNCTION: Auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_referrals
  BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_rewards
  BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ============================================================
-- FUNCTION: Recompute user referral counts
-- ============================================================
CREATE OR REPLACE FUNCTION recompute_referral_counts(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET
    referrals_count   = (SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id),
    valid_referrals   = (SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id AND status = 'valid'),
    pending_referrals = (SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id AND status = 'pending'),
    rejected_referrals = (SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id AND status IN ('rejected', 'fraud'))
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Refresh leaderboard for current month
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_leaderboard(p_month TEXT)
RETURNS VOID AS $$
DECLARE
  current_week_start DATE;
BEGIN
  current_week_start := DATE_TRUNC('week', NOW())::DATE;

  INSERT INTO leaderboard (user_id, monthly_referrals, weekly_referrals, all_time_referrals, contest_month)
  SELECT
    u.id,
    COALESCE(SUM(CASE WHEN r.created_at >= DATE_TRUNC('month', NOW()) THEN 1 ELSE 0 END), 0) AS monthly_referrals,
    COALESCE(SUM(CASE WHEN r.created_at >= current_week_start THEN 1 ELSE 0 END), 0) AS weekly_referrals,
    u.valid_referrals,
    p_month
  FROM users u
  LEFT JOIN referrals r ON r.referrer_id = u.id AND r.status = 'valid'
  WHERE u.is_banned = FALSE
  GROUP BY u.id
  ON CONFLICT (user_id, contest_month) DO UPDATE SET
    monthly_referrals = EXCLUDED.monthly_referrals,
    weekly_referrals = EXCLUDED.weekly_referrals,
    all_time_referrals = EXCLUDED.all_time_referrals,
    updated_at = NOW();

  -- Re-rank
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY monthly_referrals DESC) AS rn
    FROM leaderboard WHERE contest_month = p_month
  )
  UPDATE leaderboard l SET rank = r.rn
  FROM ranked r WHERE l.id = r.id AND l.contest_month = p_month;
END;
$$ LANGUAGE plpgsql;
