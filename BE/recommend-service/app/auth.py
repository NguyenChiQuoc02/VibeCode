import base64

import jwt
from fastapi import Header, HTTPException

from app.config import get_settings


def _claims(authorization: str | None) -> dict | None:
    """Đọc JWT (HMAC, cùng secret với auth-service; jjwt tự chọn HS256/384/512 theo độ dài khóa). Không hợp lệ thì trả None."""
    secret = get_settings().jwt_secret
    if not secret or not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return jwt.decode(authorization[7:], base64.b64decode(secret), algorithms=["HS256", "HS384", "HS512"])
    except jwt.PyJWTError:
        return None


def require_user(authorization: str | None = Header(default=None)) -> dict:
    if not get_settings().jwt_secret:
        raise HTTPException(500, "Máy chủ chưa cấu hình JWT_SECRET")
    claims = _claims(authorization)
    if not claims:
        raise HTTPException(401, "Vui lòng đăng nhập")
    return claims


def require_admin(authorization: str | None = Header(default=None)) -> dict:
    claims = require_user(authorization)
    if claims.get("role") != "ADMIN":
        raise HTTPException(403, "Chỉ quản trị viên mới được thực hiện thao tác này")
    return claims


def optional_user(authorization: str | None = Header(default=None)) -> dict | None:
    """Có token hợp lệ thì trả thông tin người dùng, không thì None (cho API công khai ghi nhận người dùng nếu có)."""
    return _claims(authorization)
