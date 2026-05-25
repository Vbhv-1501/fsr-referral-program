// frontend/components/LeaderboardPreview.jsx
import { motion } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';
import { leaderboardAPI } from '../lib/api';

const fetcher = () => leaderboardAPI.top10().then((r) => r.data);

const getRankBadgeClass = (rank) => {
  if (rank === 1) return 'rank-badge rank-badge-gold';
  if (rank === 2) return 'rank-badge rank-badge-silver';
  if (rank === 3) return 'rank-badge rank-badge-bronze';
  return 'rank-badge rank-badge-other';
};

const getMedal = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

const SkeletonRow = () => (
  <div className="flex items-center gap-4 py-3 border-b border-brand-border/50 last:border-0">
    <div className="shimmer-line w-8 h-8 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="shimmer-line h-3 w-32 rounded" />
      <div className="shimmer-line h-2 w-20 rounded" />
    </div>
    <div className="shimmer-line h-4 w-16 rounded" />
  </div>
);

export default function LeaderboardPreview() {
  const { data, isLoading } = useSWR('leaderboard-top10', fetcher, {
    refreshInterval: 60000,
  });

  const entries = data?.entries || [];

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="section-badge">🏆 Live Rankings</span>
          <h2 className="section-title">This Month's Top Referrers</h2>
          <p className="text-brand-white-muted mt-3 text-sm">
            Updated every 30 minutes. Will you claim the #1 spot?
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-glow overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-brand-border">
            <span className="text-xs font-mono text-brand-white-muted">RANK · USER</span>
            <span className="text-xs font-mono text-brand-white-muted">REFERRALS</span>
          </div>

          {/* Rows */}
          <div>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
              : entries.length === 0
              ? (
                <div className="text-center py-12 text-brand-white-muted text-sm">
                  No entries yet. Be the first to refer!
                </div>
              )
              : entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 py-3 border-b border-brand-border/40 last:border-0 group hover:bg-brand-yellow/3 transition-colors rounded-lg px-1"
                >
                  {/* Rank */}
                  <div className={`${getRankBadgeClass(i + 1)} text-xs flex-shrink-0 font-mono`}>
                    {getMedal(i + 1)}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-brand-yellow/20 border border-brand-yellow/20 flex items-center justify-center text-sm font-display font-bold text-brand-yellow flex-shrink-0">
                    {(entry.first_name || entry.username || 'U').charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-medium text-brand-white text-sm truncate">
                      {entry.first_name || entry.username || 'Anonymous'}
                    </div>
                    {entry.username && (
                      <div className="text-xs text-brand-white-muted truncate">
                        @{entry.username}
                      </div>
                    )}
                  </div>

                  {/* Referral count */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-display font-bold text-brand-yellow tabular-nums">
                      {entry.monthly_referrals.toLocaleString()}
                    </div>
                    <div className="text-xs text-brand-white-muted">referrals</div>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between">
            <span className="text-xs text-brand-white-muted">
              🔄 Auto-updates every 30 min
            </span>
            <Link
              href="/leaderboard"
              className="text-xs text-brand-yellow hover:text-brand-yellow-light font-mono transition-colors"
            >
              Full Leaderboard →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
