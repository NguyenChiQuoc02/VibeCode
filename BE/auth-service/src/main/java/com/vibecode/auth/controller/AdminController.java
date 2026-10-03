package com.vibecode.auth.controller;

import com.vibecode.auth.dto.UserResponse;
import com.vibecode.auth.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository users;

    public AdminController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/users")
    public List<UserResponse> listUsers() {
        return users.findAll().stream().map(UserResponse::from).toList();
    }
}
