'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { adminAuthApi } from '@/lib/adminAuthApi';
import toast from 'react-hot-toast';
import { Users, AlertTriangle, BarChart2, TrendingUp, Search, Ban, CheckCircle, XCircle, Calendar, Shield, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type AdminTab = 'overview' | 'users' | 'referrals' | 'analytics';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [refFilter, setRefFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{username: string} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    if (userStr) setAdminUser(JSON.parse(userStr));

    adminAuthApi.verify().catch(() => {
      handleLogout();
    });
  }, [router]);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) return;
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'overview' || tab === 'users') {
        const r = await adminAuthApi.users(1, search);
        setUsers(r.data.users);
      }
      if (tab === 'referrals') {
        const r = await adminAuthApi.referrals(1, refFilter);
        setReferrals(r.data.referrals);
      }
      if (tab === 'analytics' || tab === 'overview') {
        // use overview endpoint for quick stats, analytics for graphs
        if (tab === 'overview') {
          const r = await adminAuthApi.overview();
          setAnalytics(r.data);
        } else {
          const r = await adminAuthApi.analytics();
          setAnalytics(r.data);
        }
      }
    } catch { 
      toast.error('Failed to load data');
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.replace('/admin/login');
  };

  const handleBan = async (userId: string, isBanned: boolean) => {
    try {
      if (isBanned) { await adminAuthApi.unbanUser(userId); toast.success('User unbanned'); }
      else { await adminAuthApi.banUser(userId); toast.success('User banned'); }
      fetchData();
    } catch { toast.error('Action failed'); }
  };

  const handleMonthlyReset = async () => {
    if (!confirm('Reset monthly contest? This will snapshot current winners and clear monthly counts.')) return;
    try {
      const r = await adminAuthApi.resetMonthly();
      toast.success(`Reset complete! ${r.data.winnersCount} winners recorded.`);
      fetchData();
    } catch { toast.error('Reset failed'); }
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF7F7' }}>
        <div className="w-8 h-8 border-2 border-[#C85A5A]/30 border-t-[#C85A5A] rounded-full animate-spin" />
      </div>
    );
  }

  const TABS = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'users' as AdminTab, label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'referrals' as AdminTab, label: 'Referrals', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'analytics' as AdminTab, label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  const customTooltipStyle = {
    background: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12,
    color: '#0D0D0D',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    fontSize: 13,
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F7' }}>
      {/* ─── Admin Header ───────────────────────────────── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(80,48,48,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F2DDDD' }}>
              <Shield className="w-5 h-5 text-[#9F4F4F]" />
            </div>
            <div>
              <h1 className="font-extrabold text-[#181414] text-base">Admin Dashboard</h1>
              <p className="text-xs" style={{ color: '#8C8383' }}>Welcome, {adminUser?.username || 'Admin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleMonthlyReset}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#FFF7F7', color: '#9F4F4F', border: '1px solid rgba(184,91,91,0.18)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F2DDDD')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FFF7F7')}>
              <Calendar className="w-4 h-4" /> Monthly Reset
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs transition-colors px-3 py-2 rounded-lg border hover:bg-[#FAF7F7]" style={{ color: '#6F6868', borderColor: 'rgba(80,48,48,0.1)' }}>
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Nav */}
        <div className="flex gap-2 mb-7 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
              style={tab === t.id
                ? { background: '#B85B5B', color: '#FFFFFF' }
                : { background: '#FFFFFF', color: '#888', border: '1px solid rgba(0,0,0,0.07)' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview ─────────────────────────────────── */}
        {tab === 'overview' && analytics && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: analytics.users?.total || 0, color: '#2563eb', bg: 'rgba(37,99,235,0.07)' },
                { label: 'New Today', value: analytics.users?.today || 0, color: '#16a34a', bg: 'rgba(22,163,74,0.07)' },
                { label: 'Verified Refs', value: analytics.referrals?.verified || 0, color: '#A85656', bg: 'rgba(200,90,90,0.1)' },
                { label: 'Fraud Flags', value: analytics.referrals?.fraud || 0, color: '#dc2626', bg: 'rgba(220,38,38,0.07)' },
              ].map((s, i) => (
                <div key={i} className="glass-card p-5 rounded-2xl" style={{ borderLeft: `3px solid ${s.color}30` }}>
                  <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-sm text-[#888]">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="glass-card p-6 rounded-2xl mb-8">
              <h3 className="font-bold text-[#0D0D0D] mb-5">Top Promoters</h3>
              <div className="space-y-2.5">
                {analytics.topReferrers?.slice(0, 5).map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FAF7F7' }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: i === 0 ? '#C85A5A' : '#F1EAEA', color: '#0D0D0D' }}>
                      #{i + 1}
                    </div>
                    <span className="text-sm font-medium text-[#0D0D0D] flex-1">{p.firstName}</span>
                    {p.telegramUsername && <span className="text-xs text-[#AAA]">@{p.telegramUsername}</span>}
                    <span className="font-bold text-[#A85656]">{p.referralsCount} refs</span>
                  </div>
                ))}
                {!analytics.topReferrers?.length && <div className="text-sm text-[#AAA]">No promoters yet</div>}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Users ─────────────────────────────────────── */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                <input type="text" placeholder="Search users by name, email, or @username..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                  className="input-field pl-11" />
              </div>
              <button onClick={fetchData} className="btn-primary px-5 py-3 rounded-xl">Search</button>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#FAF7F7', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                      className="text-xs uppercase tracking-wider text-[#AAA]">
                      <th className="text-left px-5 py-4">User</th>
                      <th className="text-left px-5 py-4">Contact</th>
                      <th className="text-center px-5 py-4">Refs</th>
                      <th className="text-center px-5 py-4">Rank</th>
                      <th className="text-center px-5 py-4">Status</th>
                      <th className="text-right px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="leaderboard-row">
                        <td className="px-5 py-4">
                          <div className="font-medium text-[#0D0D0D]">{u.firstName} {u.lastName}</div>
                          <div className="text-xs text-[#AAA]">{u.createdAt?.slice(0, 10)}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs text-[#666]">{u.telegramUsername && `@${u.telegramUsername}`}</div>
                          <div className="text-xs text-[#AAA]">{u.email}</div>
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-[#A85656]">{u.referralsCount}</td>
                        <td className="px-5 py-4 text-center text-[#0D0D0D] font-medium">#{u.rank || '—'}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            u.isBanned ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {u.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => handleBan(u.id, u.isBanned)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                              u.isBanned
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            }`}>
                            <Ban className="w-3.5 h-3.5 inline mr-1" />
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12 text-[#AAA] text-sm">No users found</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Referrals ─────────────────────────────────── */}
        {tab === 'referrals' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-wrap gap-2 mb-5">
              {['', 'PENDING', 'VERIFIED', 'REJECTED', 'LEFT_CHANNEL'].map((s) => (
                <button key={s} onClick={() => { setRefFilter(s); fetchData(); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border"
                  style={refFilter === s
                    ? { background: '#B85B5B', color: '#FFF', borderColor: '#B85B5B' }
                    : { background: '#FFF', color: '#888', borderColor: 'rgba(0,0,0,0.08)' }}>
                  {s || 'All'}
                </button>
              ))}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#FAF7F7', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                      className="text-xs uppercase tracking-wider text-[#AAA]">
                      <th className="text-left px-5 py-4">Referrer</th>
                      <th className="text-left px-5 py-4">Referred</th>
                      <th className="text-center px-5 py-4">Status</th>
                      <th className="text-center px-5 py-4">Fraud</th>
                      <th className="text-center px-5 py-4">Date</th>
                      <th className="text-right px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((r) => (
                      <tr key={r.id} className="leaderboard-row">
                        <td className="px-5 py-4 text-[#0D0D0D] text-xs font-medium">{r.referrer?.firstName} <span className="text-[#AAA] font-normal">@{r.referrer?.telegramUsername}</span></td>
                        <td className="px-5 py-4 text-[#666] text-xs">{r.referredEmail || r.referredTelegramId || 'Unknown'}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            r.status === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-200' :
                            r.status === 'PENDING' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-red-50 text-red-600 border-red-200'
                          }`}>{r.status}</span>
                        </td>
                        <td className="px-5 py-4 text-center text-xs">
                          {r.fraudFlag ? (
                            <span className="text-red-500 flex items-center justify-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {r.fraudReason}
                            </span>
                          ) : <span className="text-[#DDD]">—</span>}
                        </td>
                        <td className="px-5 py-4 text-center text-xs text-[#AAA]">{r.createdAt?.slice(0, 10)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status !== 'VERIFIED' && (
                              <button onClick={() => adminAuthApi.approveReferral(r.id).then(fetchData)}
                                className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-all">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {r.status !== 'REJECTED' && (
                              <button onClick={() => adminAuthApi.rejectReferral(r.id).then(fetchData)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all">
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {referrals.length === 0 && (
                  <div className="text-center py-12 text-[#AAA] text-sm">No referrals found</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Analytics ─────────────────────────────────── */}
        {tab === 'analytics' && analytics && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { title: 'Daily Signups (30 Days)', data: analytics.dailySignups || [], key: 'count', color: '#C85A5A' },
              { title: 'Daily Verified Referrals (30 Days)', data: analytics.dailyReferrals || [], key: 'count', color: '#16a34a' },
            ].map((chart, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl">
                <h3 className="font-bold text-[#0D0D0D] mb-5">{chart.title}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#AAA', fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fill: '#AAA', fontSize: 10 }} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2.5}
                      dot={{ fill: chart.color, r: 3, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

