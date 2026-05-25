'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { statsApi } from '@/lib/api';
import { PLATFORM_CONFIG } from '@/lib/config';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { ArrowRight, Send, Users, Gift, Star, Zap } from 'lucide-react';

export default function HeroSection() {
  const [stats, setStats] = useState({ totalUsers: 0, totalVerified: 0, totalRewardsDistributed: 0, liveOnline: 0 });
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  useEffect(() => {
    statsApi.getLive().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const registerHref = refCode ? `/register?ref=${refCode}` : '/register';

  return (
    <section
      className="relative overflow-hidden pt-32 pb-24 sm:pt-36 sm:pb-28"
      style={{ background: '#FAF7F7' }}
    >
      <div className="absolute inset-0 grid-bg opacity-45 pointer-events-none" />
      <div
        className="absolute left-1/2 top-20 h-80 w-[min(760px,90vw)] -translate-x-1/2 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(184,91,91,0.08)' }}
      />

      <div className="section-shell relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mx-auto max-w-5xl text-center"
        >
          <div
            className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-bold"
            style={{ background: '#fff', border: '1px solid rgba(80,48,48,0.1)', color: '#6F6868' }}
          >
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>{stats.liveOnline || 47} online</span>
            <span style={{ color: '#B85B5B' }}>May contest active</span>
          </div>

          <span className="section-label block">Free Study Resources</span>
          <h1
            className="mx-auto mt-5 max-w-5xl font-extrabold leading-[1.05] text-[#181414]"
            style={{ fontSize: 'clamp(2.7rem, 6vw, 5.25rem)' }}
          >
            Invite friends.
            <br />
            Win Rs. 5,000 every month.
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 sm:text-lg" style={{ color: '#6F6868' }}>
            Share your referral link, bring learners into the Telegram community, and track your rank with a clean monthly leaderboard.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
            <Link href={registerHref} className="btn-primary px-8 py-4">
              Join the contest
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href={PLATFORM_CONFIG.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-8 py-4"
            >
              <Send className="h-5 w-5" />
              Join Telegram
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="glass-card p-5 sm:p-7">
            <div className="mb-6 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
              <div>
                <div className="text-base font-bold text-[#181414]">Live community snapshot</div>
                <div className="text-sm" style={{ color: '#8C8383' }}>Updated from the referral system</div>
              </div>
              <div className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: '#F2DDDD', color: '#9F4F4F' }}>
                Active
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Users className="h-5 w-5" />, label: 'Members', target: stats.totalUsers || 2847, suffix: '+' },
                { icon: <Star className="h-5 w-5" />, label: 'Referrals', target: stats.totalVerified || 8392, suffix: '+' },
                { icon: <Gift className="h-5 w-5" />, label: 'Paid out', target: stats.totalRewardsDistributed || 24500, prefix: 'Rs. ' },
                { icon: <Zap className="h-5 w-5" />, label: 'Online now', target: stats.liveOnline || 47 },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border p-5 text-center" style={{ borderColor: 'rgba(80,48,48,0.09)', background: '#FAF7F7' }}>
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: '#F2DDDD', color: '#9F4F4F' }}>
                    {s.icon}
                  </div>
                  <div className="text-2xl font-extrabold text-[#181414]">
                    <AnimatedCounter target={s.target} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 text-xs font-semibold" style={{ color: '#8C8383' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-6 max-w-3xl rounded-xl p-4" style={{ background: '#FFF', border: '1px solid rgba(80,48,48,0.09)' }}>
              <div className="mb-3 flex items-center justify-between text-xs font-bold" style={{ color: '#8C8383' }}>
                <span>Monthly reward pool</span>
                <span style={{ color: '#B85B5B' }}>Top 10</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: '#F1EAEA' }}>
                <div className="h-full w-3/4 rounded-full" style={{ background: '#B85B5B' }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
