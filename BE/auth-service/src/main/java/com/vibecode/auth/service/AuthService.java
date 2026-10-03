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

    public UserResponse me(String userId) {
        return users.findById(userId).map(UserResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
    }
}
