'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { Trophy, Crown, Medal, Search } from 'lucide-react';

type FilterType = 'monthly' | 'weekly' | 'all';

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<FilterType>('monthly');
  const [search, setSearch] = useState('');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['leaderboard', filter],
    queryFn: () => {
      const fn = filter === 'monthly' ? leaderboardApi.getMonthly
               : filter === 'weekly' ? leaderboardApi.getWeekly
               : leaderboardApi.getAll;
      return fn().then((r) => r.data);
    },
    staleTime: 30000,
  });

  const filtered = search
    ? entries.filter((e: any) =>
        e.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        e.telegramUsername?.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const referralKey = filter === 'monthly' ? 'monthlyReferrals'
                    : filter === 'weekly' ? 'weeklyReferrals'
                    : 'totalReferrals';

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F7' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ background: '#C85A5A', boxShadow: '0 8px 30px rgba(200,90,90,0.4)' }}>
            <Trophy className="w-8 h-8 text-[#0D0D0D]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-4">
            Live <span className="text-gradient">Leaderboard</span>
          </h1>
          <p className="text-[#777] max-w-md mx-auto">
            Rankings updated every hour. Top 10 win guaranteed cash prizes.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: '#F1EAEA' }}>
          {(['monthly', 'weekly', 'all'] as FilterType[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all"
              style={filter === f
                ? { background: '#B85B5B', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                : { background: 'transparent', color: '#888' }}>
              {f === 'all' ? 'All Time' : f === 'weekly' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
          <input type="text" placeholder="Search by name or @username..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11" />
        </div>

        {/* Top 3 Podium */}
        {!isLoading && filtered.length >= 3 && !search && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[filtered[1], filtered[0], filtered[2]].map((entry: any, i: number) => {
              const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
              return (
                <motion.div
                  key={entry?.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="glass-card p-5 rounded-3xl text-center"
                  style={{
                    border: rank === 1 ? '2px solid rgba(200,90,90,0.5)' : '1px solid rgba(0,0,0,0.07)',
                    boxShadow: rank === 1 ? '0 8px 30px rgba(200,90,90,0.15)' : '0 2px 12px rgba(0,0,0,0.05)',
                    marginTop: rank === 1 ? 0 : 16,
                  }}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                    rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : 'rank-3'
                  }`}>
                    {rank === 1 ? <Crown className="w-6 h-6" /> : <Medal className="w-6 h-6" />}
                  </div>
                  {entry?.photoUrl ? (
                    <img src={entry.photoUrl} alt="" className="w-11 h-11 rounded-full mx-auto mb-2 ring-2 ring-[#C85A5A]/30" />
                  ) : (
                    <div className="w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center font-black text-[#0D0D0D]"
                      style={{ background: '#C85A5A' }}>
                      {entry?.firstName?.[0]}
                    </div>
                  )}
                  <div className="font-bold text-[#0D0D0D] text-sm truncate">{entry?.firstName}</div>
                  <div className="text-xs text-[#AAA] mb-2">@{entry?.telegramUsername || 'user'}</div>
                  <div className={`text-2xl font-black ${rank === 1 ? 'text-[#A85656]' : 'text-[#0D0D0D]'}`}>
                    {entry?.[referralKey]}
                  </div>
                  <div className="text-xs text-[#AAA]">referrals</div>
                  {entry?.badge && <div className="mt-2 text-xs font-medium text-[#A85656]">{entry.badge}</div>}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full Table */}
        <div className="glass-card rounded-3xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#AAA]">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No entries found</p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#AAA]"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="col-span-1">Rank</div>
                <div className="col-span-7">User</div>
                <div className="col-span-2 text-center">Refs</div>
                <div className="col-span-2 text-right">Badge</div>
              </div>

              {filtered.map((entry: any, i: number) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  className="grid grid-cols-12 gap-2 items-center px-5 py-4 leaderboard-row"
                  style={{ background: i === 0 ? 'rgba(200,90,90,0.04)' : 'transparent' }}
                >
                  <div className="col-span-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                      i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''
                    }`}
                      style={i >= 3 ? { background: '#F1EAEA', color: '#888' } : {}}>
                      {i < 3 ? (i === 0 ? <Crown className="w-3.5 h-3.5" /> : <Medal className="w-3.5 h-3.5" />) : `#${i + 1}`}
                    </div>
                  </div>
                  <div className="col-span-7 flex items-center gap-3">
                    {entry.photoUrl ? (
                      <img src={entry.photoUrl} alt="" className="w-9 h-9 rounded-full flex-shrink-0 object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: i === 0 ? '#C85A5A' : '#F1EAEA', color: '#0D0D0D' }}>
                        {entry.firstName?.[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-[#0D0D0D] text-sm truncate">
                        {entry.firstName} {entry.lastName || ''}
                      </div>
                      {entry.telegramUsername && (
                        <div className="text-xs text-[#AAA]">@{entry.telegramUsername}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-lg font-black ${i === 0 ? 'text-[#A85656]' : 'text-[#0D0D0D]'}`}>
                      {entry[referralKey]}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs text-[#A85656] font-medium truncate">{entry.badge}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}


