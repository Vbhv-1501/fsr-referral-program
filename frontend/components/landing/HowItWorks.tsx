'use client';
import { motion } from 'framer-motion';
import { UserPlus, Link2, Users, Send, Trophy, Gift } from 'lucide-react';

const steps = [
  { icon: <UserPlus className="w-6 h-6" />, step: '01', title: 'Sign Up', desc: 'Create your free account with Telegram or email. Done in 30 seconds.' },
  { icon: <Link2 className="w-6 h-6" />, step: '02', title: 'Get Your Link', desc: 'Receive your unique referral link. Shareable anywhere.' },
  { icon: <Send className="w-6 h-6" />, step: '03', title: 'Invite Friends', desc: 'Share on WhatsApp, Instagram, Telegram or wherever your friends are.' },
  { icon: <Users className="w-6 h-6" />, step: '04', title: 'They Join Telegram', desc: 'Your friends join the Free Study Resources Telegram channel. Auto-verified.' },
  { icon: <Trophy className="w-6 h-6" />, step: '05', title: 'Earn Referrals', desc: 'Your count goes up instantly. Watch yourself climb the leaderboard.' },
  { icon: <Gift className="w-6 h-6" />, step: '06', title: 'Win Rewards', desc: 'Top 10 earn cash every month. Rs. 5000 for Rank #1. Winners announced publicly.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section" style={{ background: '#FAF7F7' }}>
      <div className="section-shell">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="section-label block mb-3">How It Works</span>
          <h2 className="section-title">
            Six Steps to <span className="text-gradient">Winning</span>
          </h2>
          <p className="section-copy">
            Simple, transparent, and 100% fair. No tricks — just real people joining a real community.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="glass-card glass-card-hover p-7 rounded-2xl relative overflow-hidden text-center"
            >
              {/* Step watermark */}
              <div className="absolute -top-3 -right-1 text-7xl font-black select-none pointer-events-none"
                style={{ color: 'rgba(0,0,0,0.04)' }}>
                {step.step}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white"
                style={{ background: '#C85A5A', boxShadow: '0 4px 14px rgba(200,90,90,0.4)' }}>
                {step.icon}
              </div>

              <div className="section-label mb-2">Step {step.step}</div>
              <h3 className="text-lg font-bold text-[#181414] mb-2">{step.title}</h3>
              <p className="text-[#777] text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



