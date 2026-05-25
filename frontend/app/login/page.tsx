'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { PLATFORM_CONFIG } from '@/lib/config';

const BENEFITS = [
  'Unique referral link generated instantly',
  'Real-time leaderboard ranking',
  'Win up to ₹5,000 every month',
  'Verified Telegram membership tracking',
  '100% free — no hidden costs',
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'telegram' | 'email'>('telegram');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user]);

  useEffect(() => {
    if (mode !== 'telegram') return;
    (window as any).onTelegramAuth = async (data: Record<string, string>) => {
      setLoading(true);
      try {
        const res = await authApi.telegramLogin(data);
        login(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.firstName}! 🎉`);
        router.push('/dashboard');
      } catch (err: any) {
        toast.error(err?.response?.data?.error || 'Telegram login failed');
      } finally { setLoading(false); }
    };
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', PLATFORM_CONFIG.botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    const container = document.getElementById('tg-widget-login');
    if (container) { container.innerHTML = ''; container.appendChild(script); }
    return () => { delete (window as any).onTelegramAuth; };
  }, [mode]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      login(res.data.token, res.data.user);
      toast.success('Welcome back! 🎉');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#FAF7F7' }}>

      {/* ─── Left Panel (Brand) ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 auth-left relative"
      >
        {/* Top: Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Free Study Resources"
            width={140}
            height={42}
            className="h-10 w-auto object-contain brightness-0 invert"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const next = (e.target as HTMLImageElement).nextSibling as HTMLElement;
              if (next) next.style.display = 'inline';
            }}
          />
          <span className="font-black text-xl text-white hidden">
            Free<span style={{ color: '#C85A5A' }}>Study</span>
          </span>
        </Link>

        {/* Middle: Main message */}
        <div>
          <div className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: '#C85A5A' }}>
            May 2026 Contest Active
          </div>
          <h2 className="text-4xl font-black text-white mb-5 leading-tight">
            Sign in and<br />start winning<br />
            <span style={{ color: '#C85A5A' }}>₹5,000 / month.</span>
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#888' }}>
            Join thousands of learners competing for monthly cash prizes. Just invite friends to our Telegram channel and watch your rank rise.
          </p>
          <ul className="space-y-3">
            {BENEFITS.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-sm" style={{ color: '#CCC' }}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#C85A5A' }} />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '50K+', label: 'Members' },
            { value: '₹5000', label: 'Top Prize' },
            { value: '100%', label: 'Free' },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-xl font-black" style={{ color: '#C85A5A' }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#666' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Right Panel (Form) ─────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <Image src="/logo.png" alt="FSR" width={130} height={40} className="h-9 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#0D0D0D] mb-2">Welcome back 👋</h1>
            <p className="text-[#777] text-sm">Sign in to access your referral dashboard</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 rounded-2xl mb-8" style={{ background: '#F1EAEA' }}>
            {(['telegram', 'email'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={mode === m
                  ? { background: '#B85B5B', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                  : { background: 'transparent', color: '#888' }}>
                {m === 'telegram' ? '📱 Telegram Login' : '✉️ Email Login'}
              </button>
            ))}
          </div>

          {mode === 'telegram' ? (
            <div className="space-y-5">
              <div className="rounded-2xl p-6 text-center" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.07)' }}>
                <div id="tg-widget-login" className="flex justify-center min-h-[52px] mb-3" />
                <p className="text-xs" style={{ color: '#AAA' }}>
                  Clicks open Telegram for secure one-tap login. No password needed.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: '#F1EAEA' }} />
                <span className="text-xs text-[#AAA] font-medium">or use email instead</span>
                <div className="flex-1 h-px" style={{ background: '#F1EAEA' }} />
              </div>
              <button onClick={() => setMode('email')} className="btn-secondary w-full py-3 rounded-2xl text-sm">
                Sign in with Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field pl-11 pr-11"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#0D0D0D] transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 rounded-2xl font-bold text-base justify-center mt-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <><ArrowRight className="w-5 h-5" /> Sign In</>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-[#888]">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-[#A85656] hover:underline">
              Join the Contest
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


