import asyncio
import logging
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.auth import optional_user, require_admin, require_user
from app.clients import BusinessClient, DataSourceError
from app.config import get_settings
from app.engine import Model, Recommendation, TourInfo
from app.events import EVENT_TYPES, NEEDS_TARGET, EventStore
from app.places import PlaceIndex
from app.schemas import EventIn, NearbyOut, RecommendationOut, StatusOut

log = logging.getLogger("recommend")
settings = get_settings()

client = BusinessClient(settings)
events = EventStore(settings)
state: dict = {"model": None, "places": None, "built_at": None, "events_ok": False}
_lock = asyncio.Lock()


async def rebuild() -> None:
    """Lấy dữ liệu mới và dựng lại mô hình. Lỗi thì giữ mô hình cũ."""
    async with _lock:
        tours = [TourInfo.from_api(d) for d in await client.tours()]
        bookings = await client.bookings()
        places = PlaceIndex.from_api(await client.destinations(), await client.landmark_markers())
        try:
            signals = await events.signals()
            state["events_ok"] = True
        except PyMongoError as e:  # MongoDB không sẵn sàng: vẫn gợi ý được, chỉ thiếu tín hiệu hành vi
            signals = []
            state["events_ok"] = False
            log.warning("Chưa đọc được sự kiện hành vi: %s", e)
        state["places"] = places
        state["model"] = Model(tours, bookings, signals=signals, geo=places.geo(), cf_weight=settings.cf_weight)
        state["built_at"] = time.time()
        log.info("Đã dựng mô hình: %d tour, %d địa điểm, %d người dùng có lịch sử", len(tours), len(places.places), len(state["model"].history))


def seconds_until_next_refresh(now: datetime, hour: int) -> float:
    """Số giây từ `now` đến lần dựng kế tiếp lúc `hour` giờ (giờ máy chủ); đúng giờ thì tính sang ngày mai."""
    target = now.replace(hour=hour, minute=0, second=0, microsecond=0)
    if target <= now:
        target += timedelta(days=1)
    return (target - now).total_seconds()


async def _refresh_loop() -> None:
    """Dựng ngay khi khởi động (để có mô hình dùng), sau đó mỗi ngày một lần vào giờ `refresh_hour`."""
    while True:
        try:
            await rebuild()
            delay = seconds_until_next_refresh(datetime.now(), settings.refresh_hour)
            log.info("Lần dựng kế tiếp sau %.0f giây (lúc %02d:00)", delay, settings.refresh_hour)
        except (DataSourceError, KeyError, ValueError) as e:
            delay = settings.retry_seconds
            log.warning("Chưa dựng được mô hình gợi ý, thử lại sau %d giây: %s", delay, e)
        await asyncio.sleep(delay)


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        await events.ensure_indexes()
    except PyMongoError as e:
        log.warning("Chưa tạo được chỉ mục MongoDB: %s", e)
    task = asyncio.create_task(_refresh_loop())
    yield
    task.cancel()
    await client.close()
    await events.close()


app = FastAPI(title="VibeCode Recommend Service", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Lỗi trả về dạng {"message": "..."} như các service khác để FE đọc thống nhất.
@app.exception_handler(StarletteHTTPException)
async def http_error(_: Request, e: StarletteHTTPException):
    return JSONResponse({"message": e.detail}, status_code=e.status_code)


def model() -> Model:
    m = state["model"]
    if m is None:
        raise HTTPException(503, "Hệ thống gợi ý đang khởi tạo, vui lòng thử lại sau ít giây")
    return m


def out(recs: list[Recommendation]) -> list[RecommendationOut]:
    return [
        RecommendationOut(
            tour_id=r.tour.id,
            name=r.tour.name,
            image=r.tour.image,
            price=r.tour.price,
            duration_days=r.tour.duration_days,
            start_date=r.tour.start_date,
            avg_rating=r.tour.avg_rating,
            review_count=r.tour.review_count,
            score=r.score,
            reasons=r.reasons,
        )
        for r in recs
    ]


@app.get("/api/recommend/ping")
def ping() -> str:
    return "recommend-service ok"


# ---- Bước 1: gợi ý theo nội dung, vị trí và độ phổ biến (công khai) ----


@app.get("/api/recommend/tours/popular", response_model=list[RecommendationOut])
def popular(limit: int = Query(6, ge=1, le=50)):
    """Tour đang được quan tâm (nhiều người đặt, đánh giá cao)."""
    return out(model().popular(limit))


@app.get("/api/recommend/tours/{tour_id}/similar", response_model=list[RecommendationOut])
def similar(tour_id: str, limit: int = Query(6, ge=1, le=50)):
    """Tour tương tự một tour: cùng điểm đến, gần nhau, cùng khách đặt, mức giá gần nhau."""
    try:
        return out(model().similar(tour_id, limit))
    except KeyError:
        raise HTTPException(404, "Không tìm thấy tour")


@app.get("/api/recommend/places/{place_id}/nearby", response_model=list[NearbyOut])
def nearby(place_id: str, limit: int = Query(6, ge=1, le=50), radius_km: float = Query(50, gt=0, le=500)):
    """Địa điểm du lịch và di tích lân cận một địa điểm (tính theo tọa độ)."""
    places: PlaceIndex | None = state["places"]
    if places is None:
        raise HTTPException(503, "Hệ thống gợi ý đang khởi tạo, vui lòng thử lại sau ít giây")
    base = places.by_id.get(place_id)
    if base is None:
        raise HTTPException(404, "Không tìm thấy địa điểm hoặc địa điểm chưa có tọa độ")
    return [
        NearbyOut(id=p.id, kind=p.kind, name=p.name, address=p.address, image=p.image, distance_km=d)
        for p, d in places.nearby(base.lat, base.lng, limit, radius_km, exclude_id=place_id)
    ]


# ---- Bước 2: gợi ý cá nhân hóa bằng lọc cộng tác (cần đăng nhập) ----


@app.get("/api/recommend/me", response_model=list[RecommendationOut])
def for_me(limit: int = Query(6, ge=1, le=50), claims: dict = Depends(require_user)):
    """Gợi ý cá nhân hóa cho người đang đăng nhập. Chưa có lịch sử thì trả tour đang được quan tâm."""
    return out(model().for_user(claims.get("email", ""), limit))


# ---- Bước 3: thu thập sự kiện hành vi để mô hình học thêm ----


@app.post("/api/recommend/events", status_code=202)
async def add_event(body: EventIn, claims: dict | None = Depends(optional_user)):
    """Ghi một sự kiện hành vi. Không cần đăng nhập, nhưng sự kiện của người đã đăng nhập mới được dùng để cá nhân hóa."""
    if body.type not in EVENT_TYPES or (body.type in NEEDS_TARGET and not body.target_id):
        raise HTTPException(422, "Sự kiện thiếu đối tượng (targetId)")
    if body.type == "SEARCH" and not (body.query or "").strip():
        raise HTTPException(422, "Sự kiện tìm kiếm thiếu từ khóa (query)")
    doc = {
        "type": body.type,
        "targetId": body.target_id,
        "query": (body.query or "").strip() or None,
        "source": body.source,
        "sessionId": body.session_id,
        "userEmail": (claims or {}).get("email", "").lower() or None,
    }
    try:
        await events.add(doc)
    except PyMongoError:
        raise HTTPException(503, "Chưa ghi nhận được sự kiện, vui lòng thử lại sau")
    return {"ok": True}


@app.get("/api/recommend/metrics")
async def metrics(days: int = Query(30, ge=1, le=365), _: dict = Depends(require_admin)):
    """Số sự kiện theo loại và tỷ lệ bấm vào gợi ý theo từng khối (chỉ ADMIN)."""
    try:
        return await events.metrics(days)
    except PyMongoError:
        raise HTTPException(503, "Chưa đọc được dữ liệu sự kiện")


# ---- Vận hành ----


@app.post("/api/recommend/refresh", response_model=StatusOut)
async def refresh(_: dict = Depends(require_admin)):
    """Dựng lại mô hình ngay (chỉ ADMIN), dùng sau khi có thay đổi lớn về tour hoặc đăng ký."""
    try:
        await rebuild()
    except DataSourceError as e:
        raise HTTPException(502, str(e))
    return status()


@app.get("/api/recommend/status", response_model=StatusOut)
def status():
    m, p = state["model"], state["places"]
    return StatusOut(
        ready=m is not None,
        built_at=state["built_at"],
        tours=len(m.tours) if m else 0,
        places=len(p.places) if p else 0,
        users_with_history=len(m.history) if m else 0,
        events_enabled=state["events_ok"],
    )
