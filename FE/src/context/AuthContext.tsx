"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, AuthResponse, TOKEN_KEY, User } from "@/lib/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // undefined = chưa đọc localStorage, null = chưa đăng nhập
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY));
  }, []);

  const meQuery = useQuery({
    queryKey: ["me", token],
    queryFn: authApi.me,
    enabled: !!token,
    retry: false,
  });

  // Token hết hạn hoặc không hợp lệ -> đăng xuất.
  useEffect(() => {
    if (meQuery.isError) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
  }, [meQuery.isError]);

  const onAuthed = (res: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, res.token);
    queryClient.setQueryData(["me", res.token], res.user);
    setToken(res.token);
    return res.user;
  };

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authApi.login(email, password),
    onSuccess: onAuthed,
  });
  const registerMutation = useMutation({
    mutationFn: (v: { fullName: string; email: string; password: string }) => authApi.register(v.fullName, v.email, v.password),
    onSuccess: onAuthed,
  });

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    queryClient.clear();
  };

  const loading = token === undefined || (!!token && meQuery.isPending);

  return (
    <AuthContext.Provider
      value={{
        user: token ? (meQuery.data ?? null) : null,
        loading,
        login: async (email, password) => (await loginMutation.mutateAsync({ email, password })).user,
        register: async (fullName, email, password) =>
          (await registerMutation.mutateAsync({ fullName, email, password })).user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
