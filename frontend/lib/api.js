// frontend/lib/api.js
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: attach access token ─────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fsr_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const fp = localStorage.getItem('fsr_fingerprint');
    if (fp) config.headers['X-Device-Fingerprint'] = fp;
  }
  return config;
});

// ─── Response Interceptor: handle 401 / token refresh ─────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('fsr_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('fsr_access_token', data.accessToken);
        localStorage.setItem('fsr_refresh_token', data.refreshToken);

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Force logout
        localStorage.removeItem('fsr_access_token');
        localStorage.removeItem('fsr_refresh_token');
        window.location.href = '/';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── API Methods ──────────────────────────────────────────
export const authAPI = {
  loginWithTelegram: (data, ref) =>
    api.post(`/auth/telegram${ref ? `?ref=${ref}` : ''}`, data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
};

export const userAPI = {
  profile: () => api.get('/user/profile'),
  referrals: (page = 1) => api.get(`/user/referrals?page=${page}`),
  stats: () => api.get('/user/stats'),
  referralLink: () => api.get('/user/referral-link'),
};

export const leaderboardAPI = {
  get: (type = 'monthly', page = 1) =>
    api.get(`/leaderboard?type=${type}&page=${page}`),
  top10: () => api.get('/leaderboard/top10'),
  winners: () => api.get('/leaderboard/winners'),
};

export const platformAPI = {
  stats: () => api.get('/stats'),
};

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params = {}) => api.get('/admin/users', { params }),
  banUser: (id, reason) => api.post(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.post(`/admin/users/${id}/unban`),
  resetUserReferrals: (id) => api.post(`/admin/users/${id}/reset-referrals`),
  referrals: (status) => api.get('/admin/referrals', { params: { status } }),
  approveReferral: (id) => api.post(`/admin/referrals/${id}/approve`),
  rejectReferral: (id, reason) => api.post(`/admin/referrals/${id}/reject`, { reason }),
  resetContest: () => api.post('/admin/contest/reset'),
  runVerification: () => api.post('/admin/verify/run'),
  platformStats: () => api.get('/admin/stats/platform'),
};

export default api;
