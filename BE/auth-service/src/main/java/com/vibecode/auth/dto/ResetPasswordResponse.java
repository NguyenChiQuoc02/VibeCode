package com.vibecode.auth.dto;

/** Mật khẩu tạm do admin đặt lại; chỉ trả về một lần. */
public record ResetPasswordResponse(String temporaryPassword) {
}
