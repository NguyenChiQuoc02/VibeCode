import ssl

import certifi
import httpx

from app.config import Settings


class DataSourceError(Exception):
    """Không lấy được dữ liệu từ business-service hoặc auth-service."""


class BusinessClient:
    """Lấy dữ liệu qua API của business-service (không đọc thẳng database của service khác)."""

    def __init__(self, settings: Settings):
        self._s = settings
        # Chỉ định rõ kho chứng chỉ để không phụ thuộc biến SSL_CERT_FILE (trên một số máy dev biến này trỏ sai file).
        self._http = httpx.AsyncClient(timeout=20, verify=ssl.create_default_context(cafile=certifi.where()))
        self._token: str | None = None

    async def close(self) -> None:
        await self._http.aclose()

    async def _login(self) -> str:
        if not self._s.service_email or not self._s.service_password:
            raise DataSourceError("Chưa cấu hình SERVICE_EMAIL và SERVICE_PASSWORD cho recommend-service")
        r = await self._http.post(
            f"{self._s.auth_url}/api/auth/login",
            json={"email": self._s.service_email, "password": self._s.service_password},
        )
        if r.status_code != 200:
            raise DataSourceError("Không đăng nhập được auth-service bằng tài khoản dịch vụ")
        self._token = r.json()["token"]
        return self._token

    async def _get(self, path: str, authed: bool = False) -> list[dict]:
        url = f"{self._s.business_url}{path}"
        try:
            headers = {"Authorization": f"Bearer {self._token or await self._login()}"} if authed else {}
            r = await self._http.get(url, headers=headers)
            if r.status_code == 401 and authed:  # token hết hạn: đăng nhập lại rồi thử một lần nữa
                headers = {"Authorization": f"Bearer {await self._login()}"}
                r = await self._http.get(url, headers=headers)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPError as e:
            raise DataSourceError(f"Không lấy được {path}: {e}") from e

    async def tours(self) -> list[dict]:
        return await self._get("/api/business/tours")

    async def bookings(self) -> list[dict]:
        return await self._get("/api/business/bookings", authed=True)

    async def destinations(self) -> list[dict]:
        return await self._get("/api/business/destinations")

    async def landmark_markers(self) -> list[dict]:
        return await self._get("/api/business/landmarks/markers")
