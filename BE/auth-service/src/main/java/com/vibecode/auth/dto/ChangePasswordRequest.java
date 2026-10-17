package com.vibecode.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Vui lòng nhập mật khẩu hiện tại") String currentPassword,
        @NotBlank(message = "Mật khẩu mới không được để trống") @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự") String newPassword) {
}
