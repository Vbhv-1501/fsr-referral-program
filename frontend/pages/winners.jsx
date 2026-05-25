// frontend/pages/winners.jsx
import Head from 'next/head';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import useSWR from 'swr';
import { leaderboardAPI } from '../lib/api';

const REWARD_MAP = { 1: '₹5,000', 2: '₹2,000', 3: '₹1,000' };
const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const BORDER = {
  1: 'border-yellow-400/30 bg-gradient-to-b from-yellow-400/10 to-transparent',
  2: 'border-gray-300/30 bg-gradient-to-b from-gray-300/10 to-transparent',
  3: 'border-orange-400/30 bg-gradient-to-b from-orange-400/10 to-transparent',
};

export default function WinnersPage() {
  const { data, isLoading } = useSWR(
    'winners',
    () => leaderboardAPI.winners().then((r) => r.data)
  );

  // Group by contest_month
  const grouped = {};
  (data?.winners || []).forEach((w) => {
    if (!grouped[w.contest_month]) grouped[w.contest_month] = [];
    grouped[w.contest_month].push(w);
  });
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <Head>
        <title>Winners — Free Study Resources</title>
        <meta name="description" content="Previous monthly contest winners and their prizes." />
      </Head>

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <span className="section-badge">🏆 Hall of Fame</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-white mt-2 mb-3">
              Past Winners
            </h1>
            <p className="text-brand-white-muted">
              These students topped the leaderboard and claimed their rewards.
              Could your name be here next month?
            </p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="shimmer-line h-5 w-32 rounded" />
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="shimmer-line h-36 rounded-2xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : months.length === 0 ? (
            <div className="text-center py-20 text-brand-white-muted">
              <div className="text-5xl mb-4">🏆</div>
              <p>No winners announced yet. First contest ends soon!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {months.map((month, mi) => {
                const entries = grouped[month].sort(
                  (a, b) => a.rank_achieved - b.rank_achieved
                );
                return (
                  <motion.div
                    key={month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: mi * 0.1 }}
                  >
                    {/* Month heading */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-px flex-1 bg-brand-border" />
                      <span className="font-mono text-sm text-brand-white-muted">
                        {format(new Date(`${month}-01`), 'MMMM yyyy')}
                      </span>
                      <div className="h-px flex-1 bg-brand-border" />
                    </div>

                    {/* Podium cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {entries.map((winner) => (
                        <motion.div
                          key={winner.rank_achieved}
                          whileHover={{ scale: 1.02 }}
                          className={`rounded-2xl border p-5 text-center ${
                            BORDER[winner.rank_achieved] || 'border-brand-border'
                          }`}
                        >
                          <div className="text-4xl mb-3">
                            {MEDAL[winner.rank_achieved] || `#${winner.rank_achieved}`}
                          </div>

                          {/* Avatar */}
                          <div className="w-14 h-14 rounded-full bg-brand-yellow/20 border border-brand-yellow/30 flex items-center justify-center text-2xl font-display font-bold text-brand-yellow mx-auto mb-3">
                            {(winner.first_name || winner.username || 'U').charAt(0).toUpperCase()}
                          </div>

                          <div className="font-display font-bold text-brand-white mb-0.5">
                            {winner.first_name || 'Anonymous'}
                          </div>
                          {winner.username && (
                            <div className="text-xs text-brand-white-muted mb-3">
                              @{winner.username}
                            </div>
                          )}

                          <div className="font-display text-xl font-bold text-brand-yellow">
                            {REWARD_MAP[winner.rank_achieved] || 'Bonus'}
                          </div>
                          <div className="text-xs text-brand-white-muted mt-1">
                            {winner.referrals} referrals
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-brand-white-muted mb-4">
              Want to be on this list next month?
            </p>
            <a href="/#join" className="btn-primary">
              Join the Contest →
            </a>
          </motion.div>
        </div>
      </main>
    </>
  );
}
