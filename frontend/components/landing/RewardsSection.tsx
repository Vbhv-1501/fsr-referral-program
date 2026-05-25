'use client';
import { motion } from 'framer-motion';
import { PRIZE_STRUCTURE } from '@/lib/config';
import { Crown, Medal, Award } from 'lucide-react';
import Link from 'next/link';

const ICONS = [
  <Crown className="w-6 h-6" />,
  <Medal className="w-6 h-6" />,
  <Medal className="w-6 h-6" />,
  <Award className="w-5 h-5" />,
  <Award className="w-5 h-5" />,
  <Award className="w-5 h-5" />,
];

const CARD_STYLES = [
  { bg: '#FFF7F7', text: '#9F4F4F', iconBg: '#F2DDDD', iconColor: '#9F4F4F', border: 'rgba(184,91,91,0.22)', glow: 'rgba(184,91,91,0.12)' },
  { bg: '#FAF7F7', text: '#181414', iconBg: '#C0C0C0', iconColor: '#181414', border: 'rgba(0,0,0,0.08)', glow: 'transparent' },
  { bg: '#FAF7F7', text: '#181414', iconBg: '#CD7F32', iconColor: '#fff', border: 'rgba(0,0,0,0.08)', glow: 'transparent' },
  { bg: '#FAF7F7', text: '#181414', iconBg: '#FAF7F7', iconColor: '#A85656', border: 'rgba(0,0,0,0.08)', glow: 'transparent' },
  { bg: '#FAF7F7', text: '#181414', iconBg: '#FAF7F7', iconColor: '#A85656', border: 'rgba(0,0,0,0.08)', glow: 'transparent' },
  { bg: '#FAF7F7', text: '#181414', iconBg: '#FAF7F7', iconColor: '#A85656', border: 'rgba(0,0,0,0.08)', glow: 'transparent' },
];

export default function RewardsSection() {
  return (
    <section id="rewards" className="landing-section" style={{ background: '#FFFFFF' }}>
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-label block mb-3">Monthly Prizes</span>
          <h2 className="section-title">
            Real Cash. <span className="text-gradient">Every Month.</span>
          </h2>
          <p className="section-copy">
            Top 10 referrers earn guaranteed cash prizes — paid within 7 days after month end.
          </p>
        </motion.div>

        {/* Main Prize Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {PRIZE_STRUCTURE.slice(0, 3).map((prize, i) => {
            const s = CARD_STYLES[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="rounded-2xl p-7 text-center relative overflow-hidden"
                style={{
                  background: s.bg,
                  border: `1.5px solid ${s.border}`,
                  boxShadow: s.glow !== 'transparent' ? `0 8px 40px ${s.glow}` : '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                {i === 0 && (
                  <div className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-bold"
                    style={{ background: 'rgba(200,90,90,0.2)', color: '#C85A5A' }}>
                    Grand Prize
                  </div>
                )}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: s.iconBg, color: s.iconColor }}>
                  {ICONS[i]}
                </div>
                <div className="text-sm font-semibold mb-2" style={{ color: i === 0 ? '#9F4F4F' : '#888' }}>
                  {prize.label}
                </div>
                <div className="text-4xl font-black mb-1" style={{ color: s.text }}>
                  Rs. {prize.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs" style={{ color: i === 0 ? '#9B9292' : '#BBB' }}>Cash Prize</div>
              </motion.div>
            );
          })}
        </div>

        {/* Lower Prize Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {PRIZE_STRUCTURE.slice(3).map((prize, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="glass-card glass-card-hover rounded-2xl p-5 text-center"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(200,90,90,0.1)', color: '#A85656' }}>
                {ICONS[3 + i]}
              </div>
              <div className="text-xs text-[#888] mb-1">{prize.label}</div>
              <div className="text-2xl font-black text-[#181414]">Rs. {prize.amount.toLocaleString('en-IN')}</div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-[#AAA] text-sm mb-5">Contest resets on the 1st of every month.</p>
          <Link href="/register" className="btn-primary px-8 py-4 rounded-2xl text-base font-bold inline-flex">
            Start Earning Now
          </Link>
        </div>
      </div>
    </section>
  );
}


