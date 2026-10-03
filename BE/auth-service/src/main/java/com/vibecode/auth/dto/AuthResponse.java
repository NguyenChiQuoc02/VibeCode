package com.vibecode.auth.dto;

public record AuthResponse(String token, UserResponse user) {
}
