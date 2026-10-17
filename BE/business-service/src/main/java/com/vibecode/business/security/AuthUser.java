package com.vibecode.business.security;

/** Người dùng đang gọi API, lấy từ JWT do auth-service cấp. */
public record AuthUser(String id, String email, String role) {
    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}
