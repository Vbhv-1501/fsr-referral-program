// frontend/components/Navbar.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../lib/store';

const Logo = () => (
  <Link href="/" className="flex items-center gap-2.5 group">
    <div className="w-8 h-8 rounded-lg bg-brand-yellow flex items-center justify-center font-display font-bold text-brand-black text-sm group-hover:scale-105 transition-transform">
      FSR
    </div>
    <span className="font-display font-semibold text-sm text-brand-white hidden sm:block">
      Free Study Resources
    </span>
  </Link>
);

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: 'https://t.me/teamfreestudyresources', label: 'Telegram', external: true },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-brand-black/90 backdrop-blur-xl border-b border-brand-border/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label, external }) => (
            <a
              key={href}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className={`nav-link ${router.pathname === href ? 'text-brand-white' : ''}`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin() && (
                <Link href="/admin" className="nav-link text-brand-yellow text-xs font-mono">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn-secondary text-xs px-4 py-2">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-brand-white-muted hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/#join" className="btn-primary text-xs px-4 py-2.5">
              Join Contest →
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-brand-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 space-y-1.5">
            <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-brand-black-card border-b border-brand-border px-4 pb-4 pt-2"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map(({ href, label, external }) => (
                <a
                  key={href}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="nav-link py-2 border-b border-brand-border/40"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </a>
              ))}
              {user ? (
                <>
                  <Link href="/dashboard" className="btn-primary text-center mt-2" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-red-400 text-left">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/#join" className="btn-primary text-center mt-2" onClick={() => setMobileOpen(false)}>
                  Join Contest →
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
