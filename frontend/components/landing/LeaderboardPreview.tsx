'use client';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '@/lib/api';
import { Trophy, Crown, Medal } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardPreview() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['leaderboard', 'monthly'],
    queryFn: () => leaderboardApi.getMonthly().then((r) => r.data),
    staleTime: 60000,
  });

  const top10 = entries.slice(0, 10);

  return (
    <section className="landing-section" style={{ background: '#FAF7F7' }}>
      <div className="section-shell-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-[#A85656]" />
            <span className="section-label">Live Leaderboard</span>
          </div>
          <h2 className="section-title">Top Referrers This Month</h2>
          <p className="section-copy">Updated every hour. Top 10 earn cash prizes at month end.</p>
        </motion.div>

        <div className="glass-card rounded-2xl overflow-hidden mb-6">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-2xl" />
              ))}
            </div>
          ) : top10.length === 0 ? (
            <div className="p-10 text-center text-[#AAA]">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No referrers this month yet.<br/>Share your link to be the first!</p>
            </div>
          ) : (
            <div>
              {top10.map((entry: any, i: number) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 px-5 py-4 leaderboard-row"
                  style={{
                    background: i === 0 ? 'rgba(200,90,90,0.06)' : 'transparent',
                  }}
                >
                  {/* Rank */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''
                  }`}
                    style={i >= 3 ? { background: '#F1EAEA', color: '#888' } : {}}>
                    {i === 0 ? <Crown className="w-4 h-4" /> : i < 3 ? <Medal className="w-4 h-4" /> : `#${i + 1}`}
                  </div>

                  {/* Avatar */}
                  {entry.photoUrl ? (
                    <img src={entry.photoUrl} alt="" className="w-9 h-9 rounded-full flex-shrink-0 ring-2 ring-[#C85A5A]/20" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#181414] font-black text-sm flex-shrink-0"
                      style={{ background: '#C85A5A' }}>
                      {entry.firstName?.[0] || '?'}
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#181414] text-sm truncate">
                      {entry.firstName} {entry.lastName || ''}
                    </div>
                    <div className="text-xs text-[#A85656]">{entry.badge}</div>
                  </div>

                  {/* Count */}
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xl font-black ${i === 0 ? 'text-[#A85656]' : 'text-[#181414]'}`}>
                      {entry.monthlyReferrals}
                    </div>
                    <div className="text-xs text-[#AAA]">referrals</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/leaderboard" className="btn-secondary inline-flex items-center gap-2 px-7 py-3 rounded-2xl">
            <Trophy className="w-4 h-4" /> View Full Leaderboard
          </Link>
        </div>
      </div>
    </section>
  );
}



