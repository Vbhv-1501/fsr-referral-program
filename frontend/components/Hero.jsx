// frontend/components/Hero.jsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '../lib/store';

const TELEGRAM_URL = 'https://t.me/teamfreestudyresources';

const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 184, 0, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.12 } } },
  item: { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } },
};

export default function Hero() {
  const { user } = useAuthStore();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      <ParticleField />

      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-brand-yellow/5 blur-[100px] pointer-events-none" />

      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-4xl mx-auto px-4"
      >
        {/* Badge */}
        <motion.div variants={stagger.item} className="flex justify-center mb-6">
          <span className="section-badge animate-pulse-glow">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
            🏆 Monthly Contest — Win Up to ₹5,000
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={stagger.item}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
        >
          Invite Friends.{' '}
          <span className="relative inline-block">
            <span className="text-brand-yellow">Earn Rewards.</span>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 12"
              fill="none"
            >
              <path
                d="M2 10 Q75 2 150 6 Q225 10 298 4"
                stroke="#E6B800"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
            </svg>
          </span>
          <br />
          <span className="text-brand-white/80">Grow Together.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={stagger.item}
          className="text-brand-white-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Join the <strong className="text-brand-white">Free Study Resources</strong> referral contest.
          Share your unique link, invite friends to our Telegram channel, and compete on the
          live leaderboard for monthly prizes.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link href="/dashboard" className="btn-primary text-base px-8 py-4 animate-pulse-glow">
              🚀 Go to Dashboard
            </Link>
          ) : (
            <a href="#join" className="btn-primary text-base px-8 py-4 animate-pulse-glow">
              🏆 Join the Contest
            </a>
          )}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-base px-8 py-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.56-.48.7-.96.44l-2.64-1.94-1.28 1.22c-.14.14-.26.26-.52.26l.18-2.6 4.72-4.26c.2-.18-.04-.28-.32-.1L7.54 14.4l-2.58-.8c-.56-.18-.58-.56.12-.82l10.08-3.88c.46-.18.86.1.7.8z"/>
            </svg>
            Join Telegram Channel
          </a>
        </motion.div>

        {/* Mini stats row */}
        <motion.div
          variants={stagger.item}
          className="mt-14 flex flex-wrap justify-center gap-8 text-center"
        >
          {[
            { label: 'Active Participants', value: '10,000+' },
            { label: 'Total Rewards Paid', value: '₹50,000+' },
            { label: 'Monthly Top Prize', value: '₹5,000' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-display text-2xl font-bold text-brand-yellow">{value}</div>
              <div className="text-xs text-brand-white-muted mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-brand-white-muted">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-brand-yellow/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
