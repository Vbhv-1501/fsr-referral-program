'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Trophy, LogOut, User, BarChart2 } from 'lucide-react';
import { PLATFORM_CONFIG } from '@/lib/config';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-black/[0.06] shadow-sm py-3'
          : 'bg-white/80 backdrop-blur-xl border-b border-black/[0.04] py-4'
      }`}
    >
      <div
        className="flex items-center justify-between gap-4"
        style={{ width: 'calc(100% - 32px)', maxWidth: '80rem', margin: '0 auto' }}
      >

        {/* ─── Logo ─────────────────────────────────────── */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-3">
          {/* 
            LOGO PLACEMENT:
            Put your logo.png file at: frontend/public/logo.png
            Recommended: transparent PNG, 400×120px, horizontal layout
          */}
          <Image
            src="/logo.png"
            alt="Free Study Resources"
            width={160}
            height={48}
            className="h-9 w-9 rounded-lg object-cover"
            onError={(e) => {
              // Fallback if logo.png not found
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Fallback text logo shown if image fails */}
          <span className="hidden sm:inline font-extrabold text-base text-[#181414]">
            Free<span className="text-[#A85656]">Study</span>
          </span>
        </Link>

        {/* ─── Desktop Nav Links ─────────────────────────── */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#555]">
          <Link href="/#how-it-works" className="hover:text-[#181414] transition-colors">How It Works</Link>
          <Link href="/leaderboard" className="hover:text-[#181414] transition-colors flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Leaderboard
          </Link>
          <Link href="/#rewards" className="hover:text-[#181414] transition-colors">Prizes</Link>
          <a href={PLATFORM_CONFIG.telegramChannel} target="_blank" rel="noopener noreferrer"
            className="hover:text-[#181414] transition-colors">
            Telegram
          </a>
        </div>

        {/* ─── Auth Actions ─────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 bg-white border border-black/[0.08] px-3 py-2 rounded-xl hover:border-[#C85A5A]/50 transition-all shadow-sm"
              >
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt={user.firstName} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#C85A5A] flex items-center justify-center text-white font-bold text-xs">
                    {user.firstName[0]}
                  </div>
                )}
                <span className="text-sm font-semibold text-[#181414]">{user.firstName}</span>
                {user.rank > 0 && (
                  <span className="text-xs font-bold text-[#A85656] bg-[#C85A5A]/10 px-1.5 py-0.5 rounded-md">#{user.rank}</span>
                )}
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-xl z-50"
                  >
                    <Link href="/dashboard" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#181414] hover:bg-[#FAF7F7] transition-colors">
                      <User className="w-4 h-4 text-[#A85656]" /> Dashboard
                    </Link>
                    {user.isAdmin && (
                      <Link href="/admin" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#181414] hover:bg-[#FAF7F7] transition-colors">
                        <BarChart2 className="w-4 h-4 text-[#A85656]" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { logout(); setDropdownOpen(false); }}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left border-t border-black/[0.06]">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-secondary text-sm px-5 py-2.5 rounded-xl">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm px-5 py-2.5 rounded-xl font-bold">
                Join Contest</Link>
            </>
          )}
        </div>

        {/* ─── Mobile Hamburger ─────────────────────────── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-black/[0.05] transition-colors text-[#181414]"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ─── Mobile Menu ──────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-black/[0.06]"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              <Link href="/#how-it-works" onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 text-sm text-[#555] hover:text-[#181414] hover:bg-[#FAF7F7] rounded-xl transition-all">
                How It Works
              </Link>
              <Link href="/leaderboard" onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 text-sm text-[#555] hover:text-[#181414] hover:bg-[#FAF7F7] rounded-xl transition-all">
                Leaderboard
              </Link>
              <Link href="/#rewards" onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 text-sm text-[#555] hover:text-[#181414] hover:bg-[#FAF7F7] rounded-xl transition-all">
                Prizes
              </Link>
              <div className="pt-2 flex flex-col gap-2 border-t border-black/[0.06] mt-1">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center py-2.5 rounded-xl">Dashboard</Link>
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="btn-secondary text-sm py-2.5 rounded-xl text-red-500 border-red-200">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm text-center py-2.5 rounded-xl">Sign In</Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center py-2.5 rounded-xl">Join Contest</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}


