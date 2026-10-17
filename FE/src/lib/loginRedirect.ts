import type { User } from "@/lib/api";

const NEXT_KEY = "vibecode_next";

/** Ghi nhớ trang đang xem trước khi chuyển sang đăng nhập, để quay lại sau khi đăng nhập xong. */
export function rememberNext(path: string) {
  if (typeof window !== "undefined") sessionStorage.setItem(NEXT_KEY, path);
}

/** Trang sẽ mở sau khi đăng nhập: trang đã ghi nhớ, nếu không có thì ADMIN vào quản trị còn người dùng về trang chủ. */
export function afterLoginPath(user: User): string {
  let next: string | null = null;
  if (typeof window !== "undefined") {
    next = sessionStorage.getItem(NEXT_KEY);
    sessionStorage.removeItem(NEXT_KEY);
  }
  // Người dùng thường không được vào khu quản trị dù trang đã ghi nhớ là /dashboard.
  if (next && (user.role === "ADMIN" || !next.startsWith("/dashboard"))) return next;
  return user.role === "ADMIN" ? "/dashboard" : "/";
}
