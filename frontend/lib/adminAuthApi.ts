import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

export const adminAuthApi = {
  login: (username: string, password: string) =>
    axios.post(`${API}/admin-auth/login`, { username, password }),

  verify: () => axios.get(`${API}/admin-auth/verify`, { headers: headers() }),

  overview: () => axios.get(`${API}/admin-auth/overview`, { headers: headers() }),

  liveActivity: () => axios.get(`${API}/admin-auth/live-activity`, { headers: headers() }),

  users: (page = 1, search = '', sort = 'createdAt', order = 'desc') =>
    axios.get(`${API}/admin-auth/users`, { params: { page, search, sort, order, limit: 20 }, headers: headers() }),

  referrals: (page = 1, status = '', fraud = false) =>
    axios.get(`${API}/admin-auth/referrals`, { params: { page, status, fraud, limit: 20 }, headers: headers() }),

  analytics: () => axios.get(`${API}/admin-auth/analytics`, { headers: headers() }),

  banUser: (id: string) => axios.patch(`${API}/admin-auth/users/${id}/ban`, {}, { headers: headers() }),
  unbanUser: (id: string) => axios.patch(`${API}/admin-auth/users/${id}/unban`, {}, { headers: headers() }),

  approveReferral: (id: string) => axios.patch(`${API}/admin-auth/referrals/${id}/approve`, {}, { headers: headers() }),
  rejectReferral: (id: string) => axios.patch(`${API}/admin-auth/referrals/${id}/reject`, {}, { headers: headers() }),

  resetMonthly: () => axios.post(`${API}/admin-auth/reset-monthly`, {}, { headers: headers() }),
};
