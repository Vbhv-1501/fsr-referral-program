'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { userApi, leaderboardApi } from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { Copy, QrCode, Share2, ExternalLink, CheckCircle, Clock, XCircle, TrendingUp, Trophy, Users, Gift, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [referralData, setReferralData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [linkData, setLinkData] = useState<{ link: string; referralCode: string } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading]);

  useEffect(() => {
    if (!user) return;
    Promise.all([userApi.getReferrals(), leaderboardApi.getMonthly(), userApi.getReferralLink()])
      .then(([refs, lb, link]) => {
        setReferralData(refs.data);
        setLeaderboard(lb.data.slice(0, 5));
        setLinkData(link.data);
      }).catch(() => {}).finally(() => setLoadingData(false));
  }, [user]);

  const copyLink = () => {
    if (!linkData?.link) return;
    navigator.clipboard.writeText(linkData.link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOn = (platform: string) => {
    if (!linkData?.link) return;
    const text = `🎓 Join Free Study Resources — India's best free learning community! Sign up with my link: ${linkData.link}`;
    const urls: Record<string, string> = {
      telegram: `https://t.me/share/url?url=${encodeURIComponent(linkData.link)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    };
    window.open(urls[platform], '_blank');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF7F7' }}>
        <div className="w-8 h-8 border-2 border-[#C85A5A]/30 border-t-[#C85A5A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F7' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">

        {/* ─── Profile Header ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-3xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        >
          <div className="flex items-center gap-4">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.firstName}
                className="w-14 h-14 rounded-2xl object-cover"
                style={{ border: '2px solid rgba(200,90,90,0.3)' }} />
            ) : (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#0D0D0D] font-black text-xl"
                style={{ background: '#C85A5A' }}>
                {user.firstName[0]}
              </div>
            )}
            <div>
              <h1 className="text-xl font-black text-[#0D0D0D]">{user.firstName} {user.lastName || ''}</h1>
              {user.telegramUsername && <p className="text-sm text-[#888]">@{user.telegramUsername}</p>}
              {user.email && <p className="text-sm text-[#888]">{user.email}</p>}
            </div>
          </div>

          {user.rank > 0 && (
            <div className="text-center px-6 py-4 rounded-2xl"
              style={{ background: '#B85B5B', minWidth: 100 }}>
              <div className="text-3xl font-black" style={{ color: '#C85A5A' }}>#{user.rank}</div>
              <div className="text-xs" style={{ color: '#666' }}>Current Rank</div>
            </div>
          )}
        </motion.div>

        {/* ─── Stats Row ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            { icon: <Users className="w-5 h-5" />, label: 'Total Referrals', value: user.referralsCount, color: '#A85656', bg: 'rgba(200,90,90,0.08)' },
            { icon: <CheckCircle className="w-5 h-5" />, label: 'Verified', value: referralData?.stats?.verified || 0, color: '#16a34a', bg: 'rgba(22,163,74,0.06)' },
            { icon: <Clock className="w-5 h-5" />, label: 'Pending', value: referralData?.stats?.pending || 0, color: '#d97706', bg: 'rgba(217,119,6,0.06)' },
            { icon: <TrendingUp className="w-5 h-5" />, label: 'This Month', value: user.monthlyReferrals, color: '#2563eb', bg: 'rgba(37,99,235,0.06)' },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3 }}
              className="glass-card p-5 rounded-2xl" style={{ borderColor: s.bg }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-current"
                style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[#888] mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Referral Link Card ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 rounded-3xl mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(200,90,90,0.1)', color: '#A85656' }}>
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0D0D0D]">Your Referral Link</h3>
          </div>

          {/* Link Box */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 px-4 py-3 rounded-2xl text-sm font-mono truncate"
              style={{ background: '#FAF7F7', border: '1.5px solid rgba(0,0,0,0.08)', color: '#555' }}>
              {linkData?.link || 'Generating your link...'}
            </div>
            <button onClick={copyLink}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                copied
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'btn-primary'
              }`}>
              {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>

          {/* Share Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'telegram', label: 'Telegram', color: '#2AABEE' },
              { key: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
              { key: 'twitter', label: 'X / Twitter', color: '#0D0D0D' },
            ].map((s) => (
              <button key={s.key} onClick={() => shareOn(s.key)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:scale-105"
                style={{ borderColor: `${s.color}25`, color: s.color, background: `${s.color}08` }}>
                <Share2 className="w-3.5 h-3.5" /> {s.label}
              </button>
            ))}
            <button onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:scale-105"
              style={{ borderColor: 'rgba(200,90,90,0.3)', color: '#A85656', background: 'rgba(200,90,90,0.06)' }}>
              <QrCode className="w-3.5 h-3.5" /> QR Code
            </button>
          </div>

          {showQR && linkData?.link && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-col items-center gap-3 pt-4"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <QRCodeCanvas value={linkData.link} size={160} />
              </div>
              <p className="text-xs text-[#AAA]">Scan to join via your referral link</p>
            </motion.div>
          )}
        </motion.div>

        {/* ─── History + Mini Leaderboard ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Referral History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-3xl"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,90,90,0.1)', color: '#A85656' }}>
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#0D0D0D]">Referral History</h3>
            </div>

            {loadingData ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
              </div>
            ) : !referralData?.referrals?.length ? (
              <div className="text-center py-10">
                <Users className="w-10 h-10 mx-auto mb-3 text-[#DDD]" />
                <p className="text-sm text-[#AAA]">No referrals yet. Share your link!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {referralData.referrals.map((ref: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: '#FAF7F7', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="flex items-center gap-2">
                      {ref.status === 'VERIFIED'
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : ref.status === 'PENDING'
                        ? <Clock className="w-4 h-4 text-rose-500" />
                        : <XCircle className="w-4 h-4 text-red-400" />}
                      <span className="text-xs text-[#666] truncate max-w-[120px]">
                        {ref.referredEmail || (ref.referredTelegramId ? `TG #${ref.referredTelegramId}` : 'Unknown')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold ${
                        ref.status === 'VERIFIED' ? 'text-green-600' :
                        ref.status === 'PENDING' ? 'text-rose-600' : 'text-red-500'
                      }`}>{ref.status}</span>
                      <div className="text-xs text-[#BBB]">{new Date(ref.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Mini Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,90,90,0.1)', color: '#A85656' }}>
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#0D0D0D]">Top 5 This Month</h3>
              </div>
              <a href="/leaderboard" className="flex items-center gap-1 text-xs font-semibold text-[#A85656] hover:underline">
                View all <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2">
              {leaderboard.length === 0
                ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)
                : leaderboard.map((entry: any, i: number) => (
                  <div key={i}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{
                      background: entry.userId === user.id ? 'rgba(200,90,90,0.07)' : '#FAF7F7',
                      border: entry.userId === user.id ? '1.5px solid rgba(200,90,90,0.3)' : '1px solid rgba(0,0,0,0.05)',
                    }}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''
                    }`}
                      style={i >= 3 ? { background: '#F1EAEA', color: '#888' } : {}}>
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#0D0D0D] truncate">{entry.firstName}</div>
                    </div>
                    <div className="font-black text-[#A85656] text-sm flex-shrink-0">{entry.monthlyReferrals}</div>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


