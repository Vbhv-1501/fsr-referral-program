'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Lock, User, Eye, EyeOff, Shield } from 'lucide-react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Already logged in?
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) router.replace('/admin');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attempts >= 5) {
      setError('Too many failed attempts. Please wait 5 minutes.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/admin-auth/login`, { username, password });
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
      router.replace('/admin');
    } catch (err: any) {
      setAttempts(a => a + 1);
      setError(err?.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAF7F7' }}>
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(66,42,42,0.12)', border: '1px solid rgba(80,48,48,0.08)' }}>

          {/* Top Banner */}
          <div className="px-8 pt-10 pb-8 text-center" style={{ background: '#FFF7F7', borderBottom: '1px solid rgba(80,48,48,0.08)' }}>
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <Image
                src="/logo.png"
                alt="Free Study Resources"
                width={160}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: '#F2DDDD', border: '1px solid rgba(184,91,91,0.2)' }}>
              <Shield className="w-3.5 h-3.5" style={{ color: '#9F4F4F' }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#9F4F4F' }}>
                Admin Portal
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#181414] mb-1">Admin Sign In</h1>
            <p className="text-sm" style={{ color: '#6F6868' }}>Restricted access for authorized personnel only</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    autoComplete="username"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    autoComplete="current-password"
                    className="input-field pl-11 pr-11"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#0D0D0D] transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 rounded-xl text-sm"
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
                >
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Attempt warning */}
              {attempts > 2 && attempts < 5 && (
                <p className="text-xs text-rose-600 text-center">
                  {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining before lockout
                </p>
              )}

              <button
                type="submit"
                disabled={loading || attempts >= 5}
                className="btn-primary w-full py-4 rounded-2xl font-bold text-base justify-center disabled:opacity-60 mt-2"
                style={{ background: '#B85B5B', color: '#FFFFFF' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Shield className="w-5 h-5" /> Sign In to Admin</>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <a href="/" className="text-sm text-[#888] hover:text-[#0D0D0D] transition-colors flex items-center justify-center gap-1.5">
                Back to main site
              </a>
            </div>
          </div>
        </div>

        {/* Security notice */}
        <p className="text-center text-xs mt-4" style={{ color: '#BBB' }}>
          All admin actions are logged and monitored
        </p>
      </motion.div>
    </div>
  );
}


