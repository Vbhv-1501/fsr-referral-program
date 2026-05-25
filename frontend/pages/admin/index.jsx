// frontend/pages/admin/index.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../lib/store';
import { adminAPI } from '../../lib/api';
import { format } from 'date-fns';

// ─── Guards ──────────────────────────────────────────────────
function AdminGuard({ children }) {
  const router = useRouter();
  const { user, isInitialized, isAdmin } = useAuthStore();

  useEffect(() => {
    if (isInitialized && (!user || !isAdmin())) {
      router.push('/');
    }
  }, [user, isInitialized]);

  if (!isInitialized || !user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}

// ─── Stat Card ───────────────────────────────────────────────
function AdminStat({ label, value, icon }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-brand-white-muted text-xs mb-2">{label}</div>
          <div className="font-display text-3xl font-bold text-brand-white tabular-nums">{value ?? '—'}</div>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

// ─── Growth Chart ────────────────────────────────────────────
function GrowthChart({ data }) {
  return (
    <div className="card-glow">
      <h3 className="font-display font-semibold text-brand-white mb-4">User Growth (30 days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#707070', fontSize: 10 }}
            tickFormatter={(v) => format(new Date(v), 'MMM d')}
          />
          <YAxis tick={{ fill: '#707070', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#161616', border: '1px solid #222', borderRadius: 8, color: '#fafafa' }}
            labelFormatter={(v) => format(new Date(v), 'MMM d, yyyy')}
          />
          <Line type="monotone" dataKey="signups" stroke="#E6B800" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Users Tab ───────────────────────────────────────────────
function UsersTab() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const { data, isLoading, mutate } = useSWR(
    `admin-users-${search}-${filter}-${page}`,
    () => adminAPI.users({ search, filter, page }).then((r) => r.data),
    { debounce: 300 }
  );

  const handleBan = async (id, isBanned) => {
    setActionLoading(id);
    try {
      if (isBanned) {
        await adminAPI.unbanUser(id);
        toast.success('User unbanned');
      } else {
        const reason = prompt('Ban reason:') || 'Policy violation';
        await adminAPI.banUser(id, reason);
        toast.success('User banned');
      }
      mutate();
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetReferrals = async (id) => {
    if (!confirm('Reset all referrals for this user? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      await adminAPI.resetUserReferrals(id);
      toast.success('Referrals reset');
      mutate();
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          className="input-field flex-1"
          placeholder="Search by name, username, Telegram ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="input-field sm:w-40"
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All Users</option>
          <option value="banned">Banned</option>
          <option value="fraud">Fraud Flagged</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="shimmer-line h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {(data?.users || []).map((u) => (
              <div key={u.id} className="card flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-medium text-brand-white text-sm">
                      {u.first_name || 'Anonymous'}
                    </span>
                    {u.username && <span className="text-xs text-brand-white-muted">@{u.username}</span>}
                    <span className="font-mono text-xs text-brand-white-muted">#{u.telegram_id}</span>
                    {u.is_banned && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Banned</span>
                    )}
                  </div>
                  <div className="text-xs text-brand-white-muted mt-1">
                    ✅ {u.valid_referrals} valid · ⏳ {u.pending_referrals} pending · Joined {format(new Date(u.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleBan(u.id, u.is_banned)}
                    disabled={actionLoading === u.id}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      u.is_banned
                        ? 'border-green-500/30 text-green-400 hover:bg-green-400/10'
                        : 'border-red-500/30 text-red-400 hover:bg-red-400/10'
                    }`}
                  >
                    {u.is_banned ? 'Unban' : 'Ban'}
                  </button>
                  <button
                    onClick={() => handleResetReferrals(u.id)}
                    disabled={actionLoading === u.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-orange-500/30 text-orange-400 hover:bg-orange-400/10 transition-colors"
                  >
                    Reset Refs
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data?.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs px-4 py-2 disabled:opacity-40">
                ← Prev
              </button>
              <span className="text-xs text-brand-white-muted font-mono">{page} / {data.pages}</span>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="btn-secondary text-xs px-4 py-2 disabled:opacity-40">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Referrals Tab ───────────────────────────────────────────
function ReferralsTab() {
  const [status, setStatus] = useState('');
  const { data, isLoading, mutate } = useSWR(
    `admin-referrals-${status}`,
    () => adminAPI.referrals(status || undefined).then((r) => r.data)
  );

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveReferral(id);
      toast.success('Referral approved');
      mutate();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reject reason:') || 'Admin rejected';
    try {
      await adminAPI.rejectReferral(id, reason);
      toast.success('Referral rejected');
      mutate();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const statusBadge = (status) => {
    const cls = { valid: 'status-valid', pending: 'status-pending', rejected: 'status-rejected', fraud: 'status-fraud' };
    return <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${cls[status] || ''}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'pending', 'valid', 'rejected', 'fraud'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              status === s ? 'border-brand-yellow bg-brand-yellow/10 text-brand-yellow' : 'border-brand-border text-brand-white-muted hover:text-brand-white'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer-line h-14 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {(data?.referrals || []).map((ref) => (
            <div key={ref.id} className="card flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-brand-white font-medium">{ref.referrer_name}</span>
                  <span className="text-brand-white-muted text-xs">→</span>
                  <span className="text-brand-white font-medium">{ref.referred_name}</span>
                  {statusBadge(ref.status)}
                </div>
                <div className="text-xs text-brand-white-muted mt-1">
                  {format(new Date(ref.created_at), 'MMM d, yyyy · HH:mm')}
                  {ref.ip_address && ` · IP: ${ref.ip_address}`}
                  {ref.fraud_reason && <span className="text-red-400 ml-2">⚠ {ref.fraud_reason}</span>}
                </div>
              </div>
              {ref.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(ref.id)} className="text-xs px-3 py-1.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-400/10 transition-colors">Approve</button>
                  <button onClick={() => handleReject(ref.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-400/10 transition-colors">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────
const TABS = ['Dashboard', 'Users', 'Referrals', 'Contest'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { data: dashData, isLoading: dashLoading } = useSWR(
    'admin-dashboard',
    () => adminAPI.dashboard().then((r) => r.data)
  );

  const handleResetContest = async () => {
    if (!confirm('End the current month\'s contest and pick winners? This cannot be undone.')) return;
    try {
      const { data } = await adminAPI.resetContest();
      toast.success(`Contest ended! Winners: ${data.winners?.length || 0} selected.`);
    } catch (err) {
      toast.error('Failed to reset contest');
    }
  };

  const handleRunVerification = async () => {
    const id = toast.loading('Running verification...');
    try {
      const { data } = await adminAPI.runVerification();
      toast.success(`Done — ✅ ${data.verified} verified, ❌ ${data.invalidated} invalidated`, { id });
    } catch (err) {
      toast.error('Verification failed', { id });
    }
  };

  return (
    <AdminGuard>
      <Head>
        <title>Admin Panel — Free Study Resources</title>
      </Head>

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="section-badge">🔐 Admin</span>
              <h1 className="font-display text-3xl font-bold text-brand-white mt-1">Control Panel</h1>
            </div>
            <div className="flex gap-3">
              <button onClick={handleRunVerification} className="btn-secondary text-xs px-4 py-2">
                🔄 Run Verification
              </button>
              <button onClick={handleResetContest} className="text-xs px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors">
                🏁 End Contest
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 p-1 bg-brand-black-card rounded-xl border border-brand-border w-fit">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-display font-medium transition-all ${
                  activeTab === t
                    ? 'bg-brand-yellow text-brand-black'
                    : 'text-brand-white-muted hover:text-brand-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'Dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AdminStat label="Total Users" value={dashData?.stats?.total_users?.toLocaleString()} icon="👥" />
                <AdminStat label="Total Referrals" value={dashData?.stats?.total_referrals?.toLocaleString()} icon="🔗" />
                <AdminStat label="Rewards Paid" value={dashData?.stats?.total_rewards_dist ? `₹${dashData.stats.total_rewards_dist.toLocaleString()}` : '₹0'} icon="💰" />
                <AdminStat label="Fraud Flagged" value={dashData?.fraudCount?.toLocaleString()} icon="🚨" />
              </div>
              <GrowthChart data={dashData?.growth} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-glow">
                  <h3 className="font-display font-semibold text-brand-white mb-4">Top Promoters</h3>
                  <div className="space-y-2">
                    {(dashData?.topPromoters || []).map((u, i) => (
                      <div key={u.telegram_id} className="flex items-center justify-between py-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-brand-white-muted w-5">#{i + 1}</span>
                          <span className="text-brand-white">{u.first_name || u.username || 'Anon'}</span>
                        </div>
                        <span className="font-display font-bold text-brand-yellow">{u.valid_referrals}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-glow">
                  <h3 className="font-display font-semibold text-brand-white mb-4">Recent Signups</h3>
                  <div className="space-y-2">
                    {(dashData?.recentSignups || []).map((u) => (
                      <div key={u.id} className="flex items-center justify-between py-1.5 text-sm">
                        <span className="text-brand-white">{u.first_name || u.username || 'Anon'}</span>
                        <span className="text-xs text-brand-white-muted">{format(new Date(u.created_at), 'MMM d')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <UsersTab />
            </motion.div>
          )}

          {activeTab === 'Referrals' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ReferralsTab />
            </motion.div>
          )}

          {activeTab === 'Contest' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glow max-w-xl">
              <h3 className="font-display font-semibold text-brand-white mb-6">Contest Management</h3>
              <div className="space-y-4">
                <div className="card bg-brand-black">
                  <h4 className="font-display font-medium text-brand-white text-sm mb-2">End Month & Pick Winners</h4>
                  <p className="text-xs text-brand-white-muted mb-4">
                    This will calculate top 3 referrers, record them as winners, create reward records,
                    and update the platform stats. Irreversible.
                  </p>
                  <button onClick={handleResetContest} className="text-sm px-4 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors">
                    🏁 End Contest & Announce Winners
                  </button>
                </div>
                <div className="card bg-brand-black">
                  <h4 className="font-display font-medium text-brand-white text-sm mb-2">Manual Verification</h4>
                  <p className="text-xs text-brand-white-muted mb-4">
                    Run the daily verification job now — checks pending referrals for Telegram membership.
                  </p>
                  <button onClick={handleRunVerification} className="btn-primary text-xs px-4 py-2">
                    🔄 Run Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}
