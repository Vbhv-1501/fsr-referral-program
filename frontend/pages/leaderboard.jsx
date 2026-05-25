// frontend/pages/leaderboard.jsx
import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { leaderboardAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';

const TABS = [
  { id: 'monthly', label: 'This Month', icon: '📅' },
  { id: 'weekly', label: 'This Week', icon: '🗓' },
  { id: 'all_time', label: 'All Time', icon: '🏛' },
];

const getRankStyle = (rank) => {
  if (rank === 1) return { badge: '🥇', row: 'bg-yellow-400/5 border-yellow-400/20' };
  if (rank === 2) return { badge: '🥈', row: 'bg-gray-300/5 border-gray-400/20' };
  if (rank === 3) return { badge: '🥉', row: 'bg-orange-400/5 border-orange-400/20' };
  return { badge: `#${rank}`, row: 'border-transparent' };
};

const scoreKey = { monthly: 'monthly_referrals', weekly: 'weekly_referrals', all_time: 'all_time_referrals' };

export default function LeaderboardPage() {
  const [tab, setTab] = useState('monthly');
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();

  const { data, isLoading } = useSWR(
    `leaderboard-${tab}-${page}`,
    () => leaderboardAPI.get(tab, page).then((r) => r.data),
    { refreshInterval: 60000 }
  );

  const entries = data?.entries || [];
  const userRank = data?.userRank;

  return (
    <>
      <Head>
        <title>Leaderboard — Free Study Resources</title>
        <meta name="description" content="Live referral leaderboard. See who's winning this month's contest." />
      </Head>

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <span className="section-badge">🏆 Live Rankings</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-white mt-2 mb-3">
              Leaderboard
            </h1>
            <p className="text-brand-white-muted">
              Updated every 30 minutes. {data?.total || 0} participants this month.
            </p>
          </motion.div>

          {/* User's own rank — if logged in */}
          {user && userRank && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card border-brand-yellow/30 bg-brand-yellow/5 mb-6 flex items-center justify-between"
            >
              <div>
                <div className="text-xs text-brand-white-muted mb-1">Your current rank</div>
                <div className="font-display text-2xl font-bold text-brand-yellow">
                  #{userRank.rank}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-brand-white-muted mb-1">
                  {tab === 'monthly' ? 'This month' : tab === 'weekly' ? 'This week' : 'All time'}
                </div>
                <div className="font-display text-2xl font-bold text-brand-white">
                  {(userRank.score || 0).toLocaleString()} refs
                </div>
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-brand-black-card rounded-xl border border-brand-border">
            {TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setPage(1); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200 ${
                  tab === id
                    ? 'bg-brand-yellow text-brand-black'
                    : 'text-brand-white-muted hover:text-brand-white'
                }`}
              >
                <span className="hidden sm:inline">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <motion.div layout className="card-glow overflow-hidden">
            {/* Head */}
            <div className="grid grid-cols-12 items-center pb-3 mb-1 border-b border-brand-border text-xs font-mono text-brand-white-muted px-2">
              <span className="col-span-1">RANK</span>
              <span className="col-span-7">USER</span>
              <span className="col-span-4 text-right">REFERRALS</span>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="space-y-2 py-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="shimmer-line h-12 rounded-xl" />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-16 text-brand-white-muted">
                  <div className="text-5xl mb-4">🏆</div>
                  <p>No entries yet. Be the first referrer!</p>
                </div>
              ) : (
                <motion.div
                  key={`${tab}-${page}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1 py-1"
                >
                  {entries.map((entry, i) => {
                    const globalRank = (page - 1) * 50 + i + 1;
                    const { badge, row } = getRankStyle(globalRank);
                    const isMe = user && String(user.id) === String(entry.id);
                    const score = entry[scoreKey[tab]] || 0;

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`grid grid-cols-12 items-center py-3 px-2 rounded-xl border ${row} ${
                          isMe ? 'ring-1 ring-brand-yellow/40 bg-brand-yellow/5' : 'hover:bg-white/2'
                        } transition-colors`}
                      >
                        {/* Rank */}
                        <div className="col-span-1 font-mono text-sm text-brand-white-muted">
                          {typeof badge === 'string' && badge.startsWith('#')
                            ? badge
                            : <span className="text-base">{badge}</span>}
                        </div>

                        {/* User */}
                        <div className="col-span-7 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-yellow/20 border border-brand-yellow/20 flex items-center justify-center font-display font-bold text-brand-yellow text-sm flex-shrink-0">
                            {(entry.first_name || entry.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-display font-medium text-brand-white text-sm">
                              {entry.first_name || 'Anonymous'}
                              {isMe && <span className="ml-1.5 text-xs text-brand-yellow">(You)</span>}
                            </div>
                            {entry.username && (
                              <div className="text-xs text-brand-white-muted">@{entry.username}</div>
                            )}
                          </div>
                        </div>

                        {/* Referrals */}
                        <div className="col-span-4 text-right">
                          <div className="font-display font-bold text-brand-yellow tabular-nums">
                            {score.toLocaleString()}
                          </div>
                          <div className="text-xs text-brand-white-muted">referrals</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {data?.pages > 1 && (
              <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary text-xs px-4 py-2 disabled:opacity-40"
                >
                  ← Previous
                </button>
                <span className="text-xs text-brand-white-muted font-mono">
                  Page {page} of {data.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                  className="btn-secondary text-xs px-4 py-2 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
