const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API ?? "";

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function request<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const res = await fetch(`${AUTH_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    let message = "Đã có lỗi xảy ra";
    try {
      message = (await res.json()).message ?? message;
    } catch {
      /* body không phải JSON */
    }
    throw new Error(message);
  }
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (fullName: string, email: string, password: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    }),
  me: (token: string) => request<User>("/api/auth/me", {}, token),
  listUsers: (token: string) => request<User[]>("/api/admin/users", {}, token),
};
