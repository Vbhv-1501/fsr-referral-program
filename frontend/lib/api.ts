import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fsr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fsr_token');
        localStorage.removeItem('fsr_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  telegramLogin: (data: Record<string, string>) =>
    api.post('/auth/telegram', data),
  register: (data: { email: string; password: string; firstName: string; lastName?: string; telegramUsername?: string; ref?: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  getReferrals: (page = 1) => api.get(`/user/referrals?page=${page}`),
  getReferralLink: () => api.get('/user/referral-link'),
};

// ─── Leaderboard API ──────────────────────────────────────────────────────────
export const leaderboardApi = {
  getMonthly: () => api.get('/leaderboard/monthly'),
  getWeekly: () => api.get('/leaderboard/weekly'),
  getAll: () => api.get('/leaderboard/all'),
};

// ─── Stats API ────────────────────────────────────────────────────────────────
export const statsApi = {
  getLive: () => api.get('/stats/live'),
};

// ─── Winners API ──────────────────────────────────────────────────────────────
export const winnersApi = {
  getAll: () => api.get('/winners'),
};

// ─── Referral API ─────────────────────────────────────────────────────────────
export const referralApi = {
  track: (data: { referralCode: string; telegramId: string; telegramUsername?: string }) =>
    api.post('/referral/track', data),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers: (page = 1, search = '') => api.get(`/admin/users?page=${page}&search=${search}`),
  banUser: (userId: string) => api.post(`/admin/ban/${userId}`),
  unbanUser: (userId: string) => api.post(`/admin/unban/${userId}`),
  getReferrals: (page = 1, status = '') => api.get(`/admin/referrals?page=${page}&status=${status}`),
  approveReferral: (id: string) => api.post(`/admin/referral/approve/${id}`),
  rejectReferral: (id: string) => api.post(`/admin/referral/reject/${id}`),
  resetMonthly: () => api.post('/admin/reset-monthly'),
  getAnalytics: () => api.get('/admin/analytics'),
};
