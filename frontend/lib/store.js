// frontend/lib/store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from './api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isInitialized: false,

      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('fsr_access_token', accessToken);
          if (refreshToken) localStorage.setItem('fsr_refresh_token', refreshToken);
        }
        set({ accessToken, refreshToken });
      },

      loginWithTelegram: async (telegramData, ref) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.loginWithTelegram(telegramData, ref);
          const { user, accessToken, refreshToken } = data;

          if (typeof window !== 'undefined') {
            localStorage.setItem('fsr_access_token', accessToken);
            localStorage.setItem('fsr_refresh_token', refreshToken);
          }

          set({ user, accessToken, refreshToken, isLoading: false });
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) await authAPI.logout(refreshToken);
        } catch (_) {}

        if (typeof window !== 'undefined') {
          localStorage.removeItem('fsr_access_token');
          localStorage.removeItem('fsr_refresh_token');
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      initialize: async () => {
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('fsr_access_token')
          : null;

        if (!token) {
          set({ isInitialized: true });
          return;
        }

        try {
          const { data } = await authAPI.me();
          set({ user: data.user, isInitialized: true });
        } catch (_) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('fsr_access_token');
            localStorage.removeItem('fsr_refresh_token');
          }
          set({ user: null, accessToken: null, refreshToken: null, isInitialized: true });
        }
      },

      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),

      isAuthenticated: () => !!get().user,
      isAdmin: () => {
        const adminIds = (process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_IDS || '').split(',').map(Number);
        return adminIds.includes(Number(get().user?.telegram_id));
      },
    }),
    {
      name: 'fsr-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
