package com.vibecode.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateProfileRequest(
        @NotBlank(message = "Họ tên không được để trống") String fullName,
        @Pattern(regexp = "^$|^[0-9+\\s.-]{8,15}$", message = "Số điện thoại không hợp lệ") String phone) {
}
