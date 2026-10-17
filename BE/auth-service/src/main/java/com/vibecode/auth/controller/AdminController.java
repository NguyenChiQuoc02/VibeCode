package com.vibecode.auth.controller;

import com.vibecode.auth.dto.ResetPasswordResponse;
import com.vibecode.auth.dto.UserResponse;
import com.vibecode.auth.repository.UserRepository;
import com.vibecode.auth.service.AuthService;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository users;
    private final AuthService auth;

    public AdminController(UserRepository users, AuthService auth) {
        this.users = users;
        this.auth = auth;
    }

    @GetMapping("/users")
    public List<UserResponse> listUsers() {
        return users.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream().map(UserResponse::from).toList();
    }

    /** Đặt lại mật khẩu cho người dùng, trả về mật khẩu tạm (chỉ một lần). */
    @PostMapping("/users/{id}/reset-password")
    public ResetPasswordResponse resetPassword(@PathVariable String id) {
        return auth.resetPassword(id);
    }
}
