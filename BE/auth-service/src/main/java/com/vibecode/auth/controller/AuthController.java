package com.vibecode.auth.controller;

import com.vibecode.auth.dto.*;
import com.vibecode.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return auth.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return auth.me((String) authentication.getPrincipal());
    }

    @PutMapping("/me")
    public UserResponse updateProfile(Authentication authentication, @Valid @RequestBody UpdateProfileRequest req) {
        return auth.updateProfile((String) authentication.getPrincipal(), req);
    }

    @PutMapping("/password")
    public void changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest req) {
        auth.changePassword((String) authentication.getPrincipal(), req);
    }
}
