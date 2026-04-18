import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const STORAGE_KEY = 'flyvio_user_id';

type UserState = {
  userId: string | null;
  nickname: string | null;
  phone: string | null;
  loading: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [nickname, setNickname] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const me = await api.me(id);
      setNickname(me.nickname);
      setPhone(me.phone);
    } catch {
      setNickname(null);
      setPhone(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) refresh(userId);
    else {
      setNickname(null);
      setPhone(null);
    }
  }, [userId, refresh]);

  const login = useCallback(async (p: string) => {
    const u = await api.login(p);
    localStorage.setItem(STORAGE_KEY, u.id);
    setUserId(u.id);
    setNickname(u.nickname);
    setPhone(u.phone);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUserId(null);
    setNickname(null);
    setPhone(null);
  }, []);

  const value = useMemo(
    () => ({ userId, nickname, phone, loading, login, logout }),
    [userId, nickname, phone, loading, login, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
