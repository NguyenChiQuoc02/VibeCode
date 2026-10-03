"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, AuthResponse, User } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);
const TOKEN_KEY = "vibecode_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setLoading(false);
      return;
    }
    authApi
      .me(saved)
      .then((u) => {
        setToken(saved);
        setUser(u);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const apply = (res: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const login = useCallback(async (email: string, password: string) => apply(await authApi.login(email, password)), []);
  const register = useCallback(
    async (fullName: string, email: string, password: string) => apply(await authApi.register(fullName, email, password)),
    []
  );
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
