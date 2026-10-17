package com.vibecode.auth.service;

import com.vibecode.auth.dto.*;
import com.vibecode.auth.exception.ApiException;
import com.vibecode.auth.model.Role;
import com.vibecode.auth.model.User;
import com.vibecode.auth.repository.UserRepository;
import com.vibecode.auth.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email đã được sử dụng");
        }
        User u = new User();
        u.setFullName(req.fullName().trim());
        u.setEmail(email);
        u.setPassword(encoder.encode(req.password()));
        u.setRole(Role.USER); // public registration is always USER
        users.save(u);
        return new AuthResponse(jwt.generate(u), UserResponse.from(u));
    }

    public AuthResponse login(LoginRequest req) {
        User u = users.findByEmail(req.email().trim().toLowerCase())
                .filter(x -> encoder.matches(req.password(), x.getPassword()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));
        return new AuthResponse(jwt.generate(u), UserResponse.from(u));
    }

    public UserResponse updateProfile(String userId, UpdateProfileRequest req) {
        User u = find(userId);
        u.setFullName(req.fullName().trim());
        u.setPhone(req.phone() == null ? null : req.phone().trim());
        return UserResponse.from(users.save(u));
    }

    public void changePassword(String userId, ChangePasswordRequest req) {
        User u = find(userId);
        if (!encoder.matches(req.currentPassword(), u.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
        }
        if (encoder.matches(req.newPassword(), u.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu mới phải khác mật khẩu hiện tại");
        }
        u.setPassword(encoder.encode(req.newPassword()));
        users.save(u);
    }

    /** Admin đặt lại mật khẩu: sinh mật khẩu tạm ngẫu nhiên, trả về một lần để admin chuyển cho người dùng. */
    public ResetPasswordResponse resetPassword(String targetUserId) {
        User u = users.findById(targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        String temp = randomPassword();
        u.setPassword(encoder.encode(temp));
        users.save(u);
        return new ResetPasswordResponse(temp);
    }

    private static String randomPassword() {
        // Bỏ các ký tự dễ nhầm (0/O, 1/l/I).
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        SecureRandom rnd = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }

    private User find(String userId) {
        return users.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
    }

    public UserResponse me(String userId) {
        return users.findById(userId).map(UserResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
    }
}
