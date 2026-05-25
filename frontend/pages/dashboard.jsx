// frontend/pages/dashboard.jsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { useAuthStore } from '../lib/store';
import { userAPI } from '../lib/api';

const fetcher = (fn) => fn().then((r) => r.data);

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ label, value, icon, color = 'yellow' }) {
  const colorMap = {
    yellow: 'text-brand-yellow bg-brand-yellow/10 border-brand-yellow/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <div className="card">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border text-lg mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="font-display text-3xl font-bold text-brand-white tabular-nums">{value}</div>
      <div className="text-sm text-brand-white-muted mt-1">{label}</div>
    </div>
  );
}

// ─── Referral Link Card ─────────────────────────────────────
function ReferralLinkCard({ user }) {
  const { data } = useSWR('referral-link', () => fetcher(userAPI.referralLink));
  const [copied, setCopied] = useState(false);

  const link = data?.link || '';
  const qrUrl = data?.qrUrl || '';

  const handleCopy = () => {
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrls = [
    {
      label: 'WhatsApp',
      icon: '💬',
      url: `https://wa.me/?text=${encodeURIComponent(`🎓 Join Free Study Resources and get access to amazing free study materials!\n\nUse my referral link to join: ${link}\n\nWe're also running a contest where you can win up to ₹5,000 monthly! 🏆`)}`,
    },
    {
      label: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Join Free Study Resources via my referral link!')}`,
    },
    {
      label: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Earning rewards by sharing free study resources! 📚 Join via my link and let's win together:\n${link}\n\n#FreeStudyResources #Students #Education`)}`,
    },
  ];

  return (
    <div className="card-glow">
      <h3 className="font-display font-semibold text-brand-white mb-4">Your Referral Link</h3>

      {/* Link Box */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 input-field font-mono text-xs truncate py-2.5 bg-brand-black">
          {link || 'Loading...'}
        </div>
        <CopyToClipboard text={link} onCopy={handleCopy}>
          <button className={`btn-primary px-4 py-2.5 text-xs flex-shrink-0 transition-all ${copied ? 'bg-green-400' : ''}`}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </CopyToClipboard>
      </div>

      {/* Code Badge */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-brand-white-muted">Your code:</span>
        <span className="font-mono text-xs bg-brand-black border border-brand-border px-2 py-1 rounded-lg text-brand-yellow">
          {user?.referral_code}
        </span>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2 flex-wrap">
        {shareUrls.map(({ label, icon, url }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs px-3 py-2 gap-1"
          >
            {icon} {label}
          </a>
        ))}
      </div>

      {/* QR Code */}
      {qrUrl && (
        <div className="mt-5 pt-5 border-t border-brand-border flex items-center gap-4">
          <img src={qrUrl} alt="QR Code" className="w-20 h-20 rounded-xl border border-brand-border" />
          <div>
            <div className="font-display font-medium text-brand-white text-sm mb-1">QR Code</div>
            <p className="text-xs text-brand-white-muted">
              Download and share your QR code anywhere — posters, stories, cards.
            </p>
            <a href={qrUrl} download="fsr-referral-qr.png" className="text-xs text-brand-yellow hover:text-brand-yellow-light mt-2 inline-block transition-colors">
              Download QR →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rank Progress ───────────────────────────────────────────
function RankProgress({ user }) {
  const rank = user?.rank;
  const referralsToNext = user?.referralsToNextRank;

  if (!rank) return null;

  const progressPct = referralsToNext
    ? Math.max(0, Math.min(100, 100 - (referralsToNext / (referralsToNext + user.monthly_referrals)) * 100))
    : 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-brand-white">Rank Progress</h3>
        <span className="font-mono text-brand-yellow text-sm">#{rank}</span>
      </div>
      <div className="h-2 bg-brand-black rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="h-full bg-brand-yellow rounded-full"
        />
      </div>
      <p className="text-xs text-brand-white-muted">
        {referralsToNext
          ? `You need ${referralsToNext} more referral${referralsToNext !== 1 ? 's' : ''} to reach rank #${rank - 1}`
          : "You're at the top! 🏆 Keep it up!"}
      </p>
    </div>
  );
}

// ─── Referral History Table ──────────────────────────────────
function ReferralHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR(
    `referrals-${page}`,
    () => userAPI.referrals(page).then((r) => r.data)
  );

  const statusBadge = (status) => {
    const cls = {
      valid: 'status-valid',
      pending: 'status-pending',
      rejected: 'status-rejected',
      fraud: 'status-fraud',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${cls[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="card-glow">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-brand-white">Referral History</h3>
        <span className="text-xs text-brand-white-muted font-mono">
          {data?.total || 0} total
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer-line h-10 rounded-xl" />
          ))}
        </div>
      ) : !data?.referrals?.length ? (
        <div className="text-center py-10 text-brand-white-muted">
          <div className="text-4xl mb-3">🔗</div>
          <p className="text-sm">No referrals yet. Share your link to get started!</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {data.referrals.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-brand-black border border-brand-border/40"
              >
                <div className="w-8 h-8 rounded-full bg-brand-yellow/20 flex items-center justify-center text-sm font-bold text-brand-yellow flex-shrink-0">
                  {(ref.first_name || ref.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-medium text-brand-white text-sm truncate">
                    {ref.first_name || ref.username || 'Anonymous'}
                  </div>
                  <div className="text-xs text-brand-white-muted">
                    {format(new Date(ref.created_at), 'MMM d, yyyy · HH:mm')}
                  </div>
                </div>
                {statusBadge(ref.status)}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-brand-border">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-xs text-brand-white-muted font-mono">
                {page} / {data.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/?msg=login_required');
    }
  }, [user, isInitialized]);

  const { data: profileData } = useSWR(
    user ? 'user-profile' : null,
    () => fetcher(userAPI.profile),
    { refreshInterval: 60000 }
  );

  const profile = profileData?.user || user;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Valid Referrals', value: profile?.valid_referrals || 0, icon: '✅', color: 'green' },
    { label: 'Pending', value: profile?.pending_referrals || 0, icon: '⏳', color: 'orange' },
    { label: 'This Month', value: profile?.monthly_referrals || 0, icon: '📅', color: 'yellow' },
    { label: 'Current Rank', value: profile?.rank ? `#${profile.rank}` : 'N/A', icon: '🏆', color: 'yellow' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard — Free Study Resources</title>
      </Head>

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 border border-brand-yellow/30 flex items-center justify-center text-2xl font-display font-bold text-brand-yellow">
              {(profile?.first_name || profile?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-white">
                {profile?.first_name} {profile?.last_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {profile?.username && (
                  <span className="text-xs text-brand-white-muted font-mono">@{profile.username}</span>
                )}
                <span className="text-xs text-brand-white-muted">·</span>
                <span className="text-xs text-brand-white-muted">
                  Joined {profile?.created_at ? format(new Date(profile.created_at), 'MMM yyyy') : '—'}
                </span>
                {profile?.is_channel_member && (
                  <>
                    <span className="text-xs text-brand-white-muted">·</span>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      Channel member
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <StatCard {...s} />
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ReferralLinkCard user={profile} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-4">
              <RankProgress user={profile} />

              {/* Channel Join Prompt */}
              {!profile?.is_channel_member && (
                <div className="card border-brand-yellow/30 bg-brand-yellow/5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">⚠️</span>
                    <div>
                      <div className="font-display font-semibold text-brand-white text-sm mb-1">
                        Join the Telegram channel
                      </div>
                      <p className="text-xs text-brand-white-muted mb-3">
                        Your referrals won't count until you join our Telegram channel. It only takes one tap.
                      </p>
                      <a
                        href="https://t.me/teamfreestudyresources"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs px-4 py-2"
                      >
                        Join Channel →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Referral History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <ReferralHistory />
          </motion.div>
        </div>
      </main>
    </>
  );
}
