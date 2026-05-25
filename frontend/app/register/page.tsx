'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, AtSign, ArrowRight, Gift, CheckCircle } from 'lucide-react';
import { PLATFORM_CONFIG } from '@/lib/config';

const STEPS = [
  { icon: '🔗', text: 'Get your unique referral link' },
  { icon: '📤', text: 'Share with friends on any platform' },
  { icon: '✅', text: 'Earn points when they join Telegram' },
  { icon: '🏆', text: 'Win cash prizes every month' },
];

function RegisterForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  const [mode, setMode] = useState<'telegram' | 'email'>('telegram');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1); // multi-step form
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', telegramUsername: '', confirmPassword: '',
  });

  useEffect(() => { if (user) router.push('/dashboard'); }, [user]);

  // Telegram widget
  useEffect(() => {
    if (mode !== 'telegram') return;
    (window as any).onTelegramRegister = async (data: Record<string, string>) => {
      setLoading(true);
      try {
        const res = await authApi.telegramLogin({ ...data, ref: refCode || undefined } as any);
        login(res.data.token, res.data.user);
        toast.success(`🎉 Welcome, ${res.data.user.firstName}! Your referral link is ready.`);
        router.push('/dashboard');
      } catch (err: any) {
        toast.error(err?.response?.data?.error || 'Telegram signup failed');
      } finally { setLoading(false); }
    };
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', PLATFORM_CONFIG.botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramRegister(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    const container = document.getElementById('tg-widget-reg');
    if (container) { container.innerHTML = ''; container.appendChild(script); }
    return () => { delete (window as any).onTelegramRegister; };
  }, [mode, refCode]);

  const validateStep1 = () => {
    if (!form.firstName.trim()) { toast.error('First name is required'); return false; }
    if (!form.email.trim() || !form.email.includes('@')) { toast.error('Valid email required'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { if (validateStep1()) setStep(2); return; }

    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await authApi.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
        telegramUsername: form.telegramUsername.replace('@', '') || undefined,
        ref: refCode || undefined,
      });
      login(res.data.token, res.data.user);
      toast.success('🎉 Account created! Your referral link is ready.');
      router.push('/dashboard');
    } catch (err: any) {
      const errs = err?.response?.data?.errors;
      toast.error(errs?.[0]?.msg || err?.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const updateForm = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex" style={{ background: '#FAF7F7' }}>

      {/* ─── Left Panel ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 auth-left relative"
      >
        <Link href="/">
          <Image src="/logo.png" alt="Free Study Resources" width={140} height={42}
            className="h-10 w-auto object-contain brightness-0 invert"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="font-black text-xl text-white hidden">Free<span style={{ color: '#C85A5A' }}>Study</span></span>
        </Link>

        <div>
          {/* Referral notice */}
          {refCode && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(200,90,90,0.1)', border: '1px solid rgba(200,90,90,0.25)' }}>
              <Gift className="w-5 h-5 flex-shrink-0" style={{ color: '#C85A5A' }} />
              <p className="text-sm" style={{ color: '#C85A5A' }}>
                You were invited via a referral link! Signing up will count as a referral.
              </p>
            </div>
          )}

          <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#C85A5A' }}>
            Join Free. Win Monthly.
          </div>
          <h2 className="text-4xl font-black text-white mb-5 leading-tight">
            Create your account<br />and start competing<br />
            <span style={{ color: '#C85A5A' }}>for ₹5,000.</span>
          </h2>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(200,90,90,0.12)', border: '1px solid rgba(200,90,90,0.2)' }}>
                  {s.icon}
                </div>
                <span className="text-sm" style={{ color: '#CCC' }}>{s.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-sm italic" style={{ color: '#888' }}>
              "I referred 43 friends last month and won ₹2,000! The platform is super easy to use."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: '#C85A5A', color: '#0D0D0D' }}>R</div>
              <span className="text-sm font-semibold text-white">Rahul S.</span>
              <span className="text-xs" style={{ color: '#555' }}>Rank #3, April 2026</span>
            </div>
          </div>
        </div>

        <p className="text-xs" style={{ color: '#333' }}>
          By signing up you agree to our{' '}
          <Link href="/terms" className="underline" style={{ color: '#555' }}>Terms</Link> &{' '}
          <Link href="/privacy" className="underline" style={{ color: '#555' }}>Privacy Policy</Link>
        </p>
      </motion.div>

      {/* ─── Right Panel (Form) ─────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <Image src="/logo.png" alt="FSR" width={130} height={40} className="h-9 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </Link>
          </div>

          {/* Mobile referral banner */}
          {refCode && (
            <div className="lg:hidden mb-5 flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(200,90,90,0.1)', border: '1px solid rgba(200,90,90,0.3)' }}>
              <Gift className="w-4 h-4 flex-shrink-0 text-[#A85656]" />
              <span className="text-sm text-[#A85656] font-medium">Invited via referral link — sign up to count!</span>
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-3xl font-black text-[#0D0D0D] mb-2">Create Account</h1>
            <p className="text-[#777] text-sm">Join free and start competing for monthly prizes</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: '#F1EAEA' }}>
            {(['telegram', 'email'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={mode === m
                  ? { background: '#B85B5B', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                  : { background: 'transparent', color: '#888' }}>
                {m === 'telegram' ? '📱 Telegram' : '✉️ Email'}
              </button>
            ))}
          </div>

          {mode === 'telegram' ? (
            <div className="space-y-4">
              <div className="rounded-2xl p-6 text-center" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.07)' }}>
                <p className="text-sm font-medium text-[#0D0D0D] mb-4">
                  Fastest sign-up method — one tap with your Telegram account
                </p>
                <div id="tg-widget-reg" className="flex justify-center min-h-[52px] mb-3" />
                <p className="text-xs text-[#AAA]">Secure Telegram OAuth. No password stored.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: '#F1EAEA' }} />
                <span className="text-xs text-[#AAA] font-medium">or create with email</span>
                <div className="flex-1 h-px" style={{ background: '#F1EAEA' }} />
              </div>
              <button onClick={() => setMode('email')} className="btn-secondary w-full py-3 rounded-2xl text-sm">
                Sign up with Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-2">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= s
                        ? 'bg-[#B85B5B] text-white'
                        : 'bg-[#F1EAEA] text-[#AAA]'
                    }`}>{step > s ? <CheckCircle className="w-3.5 h-3.5" /> : s}</div>
                    {s < 2 && <div className="flex-1 h-0.5 w-8" style={{ background: step > 1 ? '#0D0D0D' : '#F1EAEA' }} />}
                  </div>
                ))}
                <span className="text-xs text-[#AAA] ml-1">{step === 1 ? 'Basic Info' : 'Set Password'}</span>
              </div>

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#333] mb-1.5">First Name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                        <input type="text" placeholder="Rahul" value={form.firstName}
                          onChange={updateForm('firstName')} required className="input-field pl-10 text-sm py-3" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#333] mb-1.5">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                        <input type="text" placeholder="Sharma" value={form.lastName}
                          onChange={updateForm('lastName')} className="input-field pl-10 text-sm py-3" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#333] mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                      <input type="email" placeholder="rahul@example.com" value={form.email}
                        onChange={updateForm('email')} required className="input-field pl-11" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#333] mb-1.5">
                      Telegram Username <span className="text-[#AAA] font-normal">(optional but recommended)</span>
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                      <input type="text" placeholder="rahulsharma" value={form.telegramUsername}
                        onChange={(e) => setForm(p => ({ ...p, telegramUsername: e.target.value.replace('@', '') }))}
                        className="input-field pl-11"
                        pattern="[a-zA-Z0-9_]{5,32}" />
                    </div>
                    <p className="text-xs text-[#AAA] mt-1.5">Without the @ symbol. Used to verify your Telegram membership.</p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Summary */}
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FAF7F7' }}>
                    <div className="w-9 h-9 rounded-full bg-[#C85A5A] flex items-center justify-center text-[#0D0D0D] font-black text-sm flex-shrink-0">
                      {form.firstName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-[#0D0D0D] text-sm">{form.firstName} {form.lastName}</div>
                      <div className="text-xs text-[#888]">{form.email}</div>
                    </div>
                    <button type="button" onClick={() => setStep(1)}
                      className="ml-auto text-xs text-[#A85656] font-medium hover:underline">Edit</button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#333] mb-1.5">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                      <input type={showPass ? 'text' : 'password'} placeholder="At least 8 characters"
                        value={form.password} onChange={updateForm('password')}
                        required minLength={8} className="input-field pl-11 pr-11" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#0D0D0D] transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#333] mb-1.5">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                      <input type="password" placeholder="Repeat password"
                        value={form.confirmPassword} onChange={updateForm('confirmPassword')}
                        required className="input-field pl-11" />
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1.5">Passwords don't match</p>
                    )}
                  </div>
                </motion.div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 rounded-2xl font-bold text-base justify-center mt-2 disabled:opacity-60">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : step === 1 ? (
                  <><ArrowRight className="w-5 h-5" /> Continue</>
                ) : (
                  <><CheckCircle className="w-5 h-5" /> Create Account</>
                )}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[#888]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#A85656] hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#FAF7F7' }} />}>
      <RegisterForm />
    </Suspense>
  );
}


