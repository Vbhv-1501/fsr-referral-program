// frontend/components/LiveStats.jsx
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import useSWR from 'swr';
import { platformAPI } from '../lib/api';

const fetcher = () => platformAPI.stats().then((r) => r.data);

const StatCard = ({ value, label, prefix = '', suffix = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="card-glow text-center"
    >
      <div className="stat-number">
        {inView && (
          <CountUp
            start={0}
            end={value}
            duration={2.5}
            separator=","
            prefix={prefix}
            suffix={suffix}
            delay={delay}
          />
        )}
      </div>
      <div className="text-sm text-brand-white-muted mt-2 font-body">{label}</div>
    </motion.div>
  );
};

export function LiveStats() {
  const { data } = useSWR('platform-stats', fetcher, { refreshInterval: 30000 });

  const stats = [
    { value: data?.total_users || 0, label: 'Total Participants', suffix: '+' },
    { value: data?.total_referrals || 0, label: 'Referrals Tracked' },
    { value: data?.total_rewards_dist || 0, label: 'Rewards Distributed', prefix: '₹' },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-badge">📊 Live Platform Stats</span>
          <h2 className="section-title">Growing Every Day</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// HowItWorks
// ──────────────────────────────────────────────────────────────
const steps = [
  {
    icon: '👤',
    step: '01',
    title: 'Sign Up',
    desc: 'Login with your Telegram account in one click. No password needed.',
  },
  {
    icon: '🔗',
    step: '02',
    title: 'Get Your Link',
    desc: 'Receive a unique referral link and QR code to share anywhere.',
  },
  {
    icon: '📢',
    step: '03',
    title: 'Invite Friends',
    desc: 'Share your link on WhatsApp, Instagram, Twitter, and more.',
  },
  {
    icon: '✅',
    step: '04',
    title: 'Friends Join Telegram',
    desc: 'When your friends join our channel, your referral is verified.',
  },
  {
    icon: '📈',
    step: '05',
    title: 'Climb the Leaderboard',
    desc: 'Watch your rank rise in real-time as referrals are confirmed.',
  },
  {
    icon: '🏆',
    step: '06',
    title: 'Win Monthly Prizes',
    desc: 'Top referrers win cash prizes at the end of each month.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="section-badge">⚡ How It Works</span>
          <h2 className="section-title">Simple. Fair. Rewarding.</h2>
          <p className="text-brand-white-muted mt-4 max-w-xl mx-auto">
            Six steps to your first referral win. The process is transparent and fraud-proof.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map(({ icon, step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="card group hover:border-brand-yellow/30 transition-colors duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-lg group-hover:bg-brand-yellow/20 transition-colors">
                    {icon}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs text-brand-yellow/60 mb-1">Step {step}</div>
                  <h3 className="font-display font-semibold text-brand-white mb-1.5">{title}</h3>
                  <p className="text-sm text-brand-white-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// RewardsSection
// ──────────────────────────────────────────────────────────────
const rewards = [
  { rank: 1, medal: '🥇', amount: '₹5,000', label: 'Champion', color: 'from-yellow-400/20 to-yellow-600/5', border: 'border-yellow-400/30' },
  { rank: 2, medal: '🥈', amount: '₹2,000', label: 'Runner Up', color: 'from-gray-300/20 to-gray-400/5', border: 'border-gray-400/30' },
  { rank: 3, medal: '🥉', amount: '₹1,000', label: '3rd Place', color: 'from-orange-400/20 to-orange-600/5', border: 'border-orange-400/30' },
  { rank: '4–10', medal: '🎁', amount: 'Bonus', label: 'Bonus Rewards', color: 'from-purple-400/10 to-purple-600/5', border: 'border-purple-400/20' },
];

export function RewardsSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span className="section-badge">💰 Monthly Prizes</span>
          <h2 className="section-title">Real Cash. Every Month.</h2>
          <p className="text-brand-white-muted mt-4">
            Contest resets at the end of each month. New month, new chance to win.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map(({ rank, medal, amount, label, color, border }, i) => (
            <motion.div
              key={rank}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border ${border} bg-gradient-to-b ${color} p-6 text-center`}
            >
              <div className="text-4xl mb-3">{medal}</div>
              <div className="font-display text-2xl font-bold text-brand-white mb-1">{amount}</div>
              <div className="text-xs text-brand-white-muted font-mono">
                Rank #{typeof rank === 'number' ? rank : rank} — {label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 card text-center">
          <p className="text-sm text-brand-white-muted">
            🔒 Rewards are distributed within 72 hours of contest end via UPI/bank transfer.
            Winners are announced on our Telegram channel.
          </p>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// FAQ
// ──────────────────────────────────────────────────────────────
import { useState } from 'react';

const faqs = [
  {
    q: 'How does referral verification work?',
    a: 'When your friend clicks your referral link and logs in, we verify they joined our Telegram channel via the Telegram API. Only confirmed joins count as valid referrals.',
  },
  {
    q: 'Can I refer the same person twice?',
    a: 'No. Each Telegram account can only count as one referral, ever. If someone leaves and rejoins the channel, it will NOT increase your count again.',
  },
  {
    q: 'What prevents fake referrals?',
    a: 'Our anti-cheat system tracks Telegram IDs (not usernames), IP addresses, and device fingerprints. Suspicious activity is automatically flagged and reviewed.',
  },
  {
    q: 'When are rewards distributed?',
    a: 'The contest runs monthly. Winners are announced within 48 hours of month-end, and rewards are transferred within 72 hours via UPI or bank transfer.',
  },
  {
    q: 'What if my referral is showing as pending?',
    a: "Your referral shows as 'pending' until we confirm the user joined our Telegram channel. Make sure they actually joined — not just clicked the link.",
  },
  {
    q: 'Can I participate from any state in India?',
    a: 'Yes! The contest is open to all students across India. International users can participate for the leaderboard but may not receive cash prizes.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-badge">❓ FAQ</span>
          <h2 className="section-title">Common Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card cursor-pointer hover:border-brand-yellow/20 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-display font-medium text-brand-white text-sm">{faq.q}</span>
                <span className={`text-brand-yellow transition-transform flex-shrink-0 ${open === i ? 'rotate-45' : ''}`}>+</span>
              </div>
              <AnimatePresence>
                {open === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-brand-white-muted mt-3 leading-relaxed overflow-hidden"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { AnimatePresence } from 'framer-motion';
