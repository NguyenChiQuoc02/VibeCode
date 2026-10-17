package com.vibecode.business.security;

import com.vibecode.business.exception.ApiException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Optional;

/** Đọc và kiểm tra JWT (HS256, cùng secret với auth-service) từ header Authorization. */
@Component
public class JwtAuth {

    private final SecretKey key;

    public JwtAuth(@Value("${app.jwt.secret:}") String secret) {
        this.key = secret == null || secret.isBlank() ? null : Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    /** Có token hợp lệ thì trả người dùng, ngược lại rỗng (dùng cho API công khai có thêm thông tin riêng). */
    public Optional<AuthUser> optional(String authHeader) {
        if (key == null || authHeader == null || !authHeader.startsWith("Bearer ")) return Optional.empty();
        try {
            Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(authHeader.substring(7)).getPayload();
            return Optional.of(new AuthUser(c.getSubject(), c.get("email", String.class), c.get("role", String.class)));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public AuthUser requireUser(String authHeader) {
        if (key == null) throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Máy chủ chưa cấu hình app.jwt.secret");
        return optional(authHeader).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập"));
    }

    public AuthUser requireAdmin(String authHeader) {
        AuthUser u = requireUser(authHeader);
        if (!u.isAdmin()) throw new ApiException(HttpStatus.FORBIDDEN, "Chỉ quản trị viên mới được thực hiện thao tác này");
        return u;
    }
}
