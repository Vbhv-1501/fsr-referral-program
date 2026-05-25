'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { userApi } from '@/lib/api';

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  telegramUsername?: string;
  email?: string;
  photoUrl?: string;
  referralCode: string;
  referralsCount: number;
  isAdmin: boolean;
  rank: number;
  monthlyReferrals: number;
  hasJoinedChannel: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('fsr_token');
    const storedUser = localStorage.getItem('fsr_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      refreshUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async (t?: string) => {
    try {
      const res = await userApi.getProfile();
      setUser(res.data);
      localStorage.setItem('fsr_user', JSON.stringify(res.data));
    } catch {
      // Token might be expired
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('fsr_token', newToken);
    localStorage.setItem('fsr_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fsr_token');
    localStorage.removeItem('fsr_user');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
