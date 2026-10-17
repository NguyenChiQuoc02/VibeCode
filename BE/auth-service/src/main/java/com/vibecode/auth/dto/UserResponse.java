package com.vibecode.auth.dto;

import com.vibecode.auth.model.Role;
import com.vibecode.auth.model.User;

public record UserResponse(String id, String fullName, String email, String phone, Role role) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRole());
    }
}
