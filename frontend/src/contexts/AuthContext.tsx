import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { auth as authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, loadProfile]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const res = await authApi.register(name, email, password, role);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
