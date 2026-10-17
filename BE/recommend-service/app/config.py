from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Cấu hình đọc từ biến môi trường hoặc file .env (đã gitignore). Xem .env.example."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    auth_url: str = "http://localhost:8081"
    business_url: str = "http://localhost:8083"
    # Tài khoản dịch vụ (ADMIN) để đọc danh sách đăng ký tour, API này chỉ dành cho quản trị viên.
    service_email: str = ""
    service_password: str = ""
    # Phải trùng app.jwt.secret của auth-service (Base64) để đọc được token của người dùng.
    jwt_secret: str = ""
    # MongoDB riêng của service (lưu sự kiện hành vi). Mỗi service một database riêng theo quy ước dự án.
    mongo_uri: str = "mongodb://localhost:27017/?directConnection=true"
    mongo_db: str = "vibecode_recommend"
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    # Giờ trong ngày (0-23, giờ máy chủ) dựng lại mô hình từ dữ liệu mới. Mặc định 0 giờ mỗi ngày.
    refresh_hour: int = 0
    # Dựng lỗi (chưa lấy được dữ liệu) thì thử lại sau ngần này giây.
    retry_seconds: int = 300
    # Tỷ trọng của lọc cộng tác so với độ giống theo nội dung khi đã có dữ liệu đăng ký.
    cf_weight: float = 0.6


@lru_cache
def get_settings() -> Settings:
    return Settings()
