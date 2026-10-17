"""Lõi gợi ý tour: lọc cộng tác theo item (item-based CF) kết hợp độ giống theo nội dung, vị trí địa lý và độ phổ biến.

Không phụ thuộc FastAPI hay mạng nên kiểm thử được bằng dữ liệu giả (xem tests/test_engine.py).
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date

import numpy as np

# Trọng số tín hiệu từ đăng ký tour: đã hoàn thành chuyến đi nói lên sở thích rõ hơn chỉ mới đăng ký.
STATUS_WEIGHT = {"REGISTERED": 1.0, "COMPLETED": 2.0}
REVIEW_BONUS = 1.0

# Trọng số tín hiệu từ sự kiện hành vi (xem, yêu thích, bấm vào gợi ý). Mỗi loại bị chặn trên để một người
# mở trang liên tục cũng không lấn át việc đã đặt tour thật.
EVENT_WEIGHT = {"VIEW_TOUR": 0.3, "FAVORITE_TOUR": 1.5, "RECOMMEND_CLICK": 0.5}
EVENT_CAP = {"VIEW_TOUR": 3, "FAVORITE_TOUR": 1, "RECOMMEND_CLICK": 2}

# Làm mượt điểm đánh giá: tour ít đánh giá bị kéo về mức trung bình trước, tránh 1 đánh giá 5 sao lên đầu bảng.
RATING_PRIOR = 4.0
RATING_PRIOR_WEIGHT = 5
POPULARITY_BOOST = 0.1
# Hai tour cách nhau quá ngần này (km) thì coi như không gần nhau.
GEO_RANGE_KM = 300.0


@dataclass(frozen=True)
class TourInfo:
    id: str
    name: str
    image: str | None
    price: int
    duration_days: int
    start_date: date | None
    status: str
    max_participants: int
    booked_seats: int
    avg_rating: float
    review_count: int
    places: frozenset[str]

    @staticmethod
    def from_api(d: dict) -> "TourInfo":
        start = d.get("startDate")
        return TourInfo(
            id=d["id"],
            name=d.get("name") or "",
            image=d.get("image"),
            price=int(d.get("price") or 0),
            duration_days=int(d.get("durationDays") or 0),
            start_date=date.fromisoformat(start) if start else None,
            status=d.get("status") or "OPEN",
            max_participants=int(d.get("maxParticipants") or 0),
            booked_seats=int(d.get("bookedSeats") or 0),
            avg_rating=float(d.get("avgRating") or 0),
            review_count=int(d.get("reviewCount") or 0),
            places=frozenset((d.get("destinationIds") or []) + (d.get("landmarkIds") or [])),
        )


@dataclass(frozen=True)
class Recommendation:
    tour: TourInfo
    score: float
    reasons: list[str]


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(a))


def _closeness(a: float, b: float) -> float:
    """1 khi bằng nhau, giảm dần về 0 khi chênh lệch lớn."""
    top = max(a, b)
    return 1.0 if top == 0 else 1.0 - min(abs(a - b) / top, 1.0)


class Model:
    def __init__(
        self,
        tours: list[TourInfo],
        bookings: list[dict],
        signals: list[dict] | None = None,
        geo: dict[str, tuple[float, float]] | None = None,
        cf_weight: float = 0.6,
        today: date | None = None,
    ):
        """
        bookings: đăng ký tour (userEmail, tourId, status, hasReview).
        signals: sự kiện hành vi đã gộp [{"email", "tourId", "type", "count"}].
        geo: tọa độ (lat, lng) theo id địa điểm, dùng đo độ gần về địa lý giữa các tour.
        """
        self.tours = tours
        self.index = {t.id: i for i, t in enumerate(tours)}
        self.today = today or date.today()
        n = len(tours)

        # email -> {tourId: trọng số}. Đăng ký đã hủy không tính.
        self.history: dict[str, dict[str, float]] = {}
        # Tour mà người dùng đã đăng ký thật: không gợi ý lại.
        self.booked: dict[str, set[str]] = {}
        for b in bookings:
            status = b.get("status")
            email = (b.get("userEmail") or "").strip().lower()
            tour_id = b.get("tourId")
            if status not in STATUS_WEIGHT or not email or tour_id not in self.index:
                continue
            w = STATUS_WEIGHT[status] + (REVIEW_BONUS if b.get("hasReview") else 0.0)
            per_user = self.history.setdefault(email, {})
            per_user[tour_id] = per_user.get(tour_id, 0.0) + w
            self.booked.setdefault(email, set()).add(tour_id)

        for s in signals or []:
            etype, email, tour_id = s.get("type"), (s.get("email") or "").strip().lower(), s.get("tourId")
            if etype not in EVENT_WEIGHT or not email or tour_id not in self.index:
                continue
            w = EVENT_WEIGHT[etype] * min(int(s.get("count") or 1), EVENT_CAP[etype])
            per_user = self.history.setdefault(email, {})
            per_user[tour_id] = per_user.get(tour_id, 0.0) + w

        self.centroids = self._centroids(geo or {})
        self.cf = self._collaborative(n)
        self.content = self._content(n)
        # Chưa có dữ liệu cộng tác thì chỉ dùng độ giống theo nội dung.
        w = cf_weight if self.cf.any() else 0.0
        self.sim = w * self.cf + (1.0 - w) * self.content
        self.popularity = self._popularity()

    # ---- dựng mô hình ----

    def _centroids(self, geo: dict[str, tuple[float, float]]) -> list[tuple[float, float] | None]:
        """Tâm địa lý của mỗi tour (trung bình tọa độ các địa điểm có tọa độ)."""
        out: list[tuple[float, float] | None] = []
        for t in self.tours:
            pts = [geo[p] for p in t.places if p in geo]
            out.append((sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)) if pts else None)
        return out

    def _collaborative(self, n: int) -> np.ndarray:
        if not self.history or n == 0:
            return np.zeros((n, n))
        users = list(self.history)
        x = np.zeros((len(users), n))
        for u, email in enumerate(users):
            for tour_id, w in self.history[email].items():
                x[u, self.index[tour_id]] = w
        norms = np.sqrt((x**2).sum(axis=0))
        dot = x.T @ x
        denom = np.outer(norms, norms)
        sim = np.divide(dot, denom, out=np.zeros_like(dot), where=denom > 0)
        np.fill_diagonal(sim, 0.0)
        return sim

    def _geo_closeness(self, i: int, j: int) -> float:
        a, b = self.centroids[i], self.centroids[j]
        if a is None or b is None:
            return 0.0
        return max(0.0, 1.0 - haversine_km(a[0], a[1], b[0], b[1]) / GEO_RANGE_KM)

    def _content(self, n: int) -> np.ndarray:
        sim = np.zeros((n, n))
        has_geo = any(c is not None for c in self.centroids)
        for i in range(n):
            for j in range(i + 1, n):
                a, b = self.tours[i], self.tours[j]
                union = a.places | b.places
                jaccard = len(a.places & b.places) / len(union) if union else 0.0
                price, days = _closeness(a.price, b.price), _closeness(a.duration_days, b.duration_days)
                if has_geo:
                    s = 0.5 * jaccard + 0.25 * self._geo_closeness(i, j) + 0.15 * price + 0.1 * days
                else:
                    s = 0.7 * jaccard + 0.2 * price + 0.1 * days
                sim[i, j] = sim[j, i] = s
        return sim

    def _popularity(self) -> np.ndarray:
        if not self.tours:
            return np.zeros(0)
        booked = np.array([t.booked_seats for t in self.tours], dtype=float)
        booked_part = booked / booked.max() if booked.max() > 0 else booked
        rating = np.array(
            [(t.avg_rating * t.review_count + RATING_PRIOR * RATING_PRIOR_WEIGHT) / (t.review_count + RATING_PRIOR_WEIGHT) for t in self.tours]
        )
        return 0.6 * booked_part + 0.4 * (rating / 5.0)

    def _bookable(self, t: TourInfo) -> bool:
        return t.status == "OPEN" and (t.start_date is None or t.start_date >= self.today) and t.booked_seats < t.max_participants

    def _top(self, scores: np.ndarray, exclude: set[int], limit: int, reasons) -> list[Recommendation]:
        order = np.argsort(-scores, kind="stable")
        out: list[Recommendation] = []
        for j in order:
            j = int(j)
            if j in exclude or not self._bookable(self.tours[j]):
                continue
            out.append(Recommendation(self.tours[j], round(float(scores[j]), 4), reasons(j)))
            if len(out) >= limit:
                break
        return out

    # ---- truy vấn ----

    def similar(self, tour_id: str, limit: int) -> list[Recommendation]:
        """Tour tương tự một tour: cùng điểm đến, gần nhau, cùng khách đặt, mức giá gần nhau. Ném KeyError nếu không có tour."""
        i = self.index[tour_id]
        base = self.tours[i]

        def reasons(j: int) -> list[str]:
            t = self.tours[j]
            r = []
            if base.places & t.places:
                r.append("Cùng điểm đến")
            elif self._geo_closeness(i, j) >= 0.7:
                r.append("Gần khu vực này")
            if self.cf[i, j] > 0:
                r.append("Khách đặt tour này cũng đặt")
            if _closeness(base.price, t.price) >= 0.8:
                r.append("Mức giá tương đương")
            return r or ["Có thể bạn quan tâm"]

        return self._top(self.sim[i] + POPULARITY_BOOST * self.popularity, {i}, limit, reasons)

    def for_user(self, email: str, limit: int) -> list[Recommendation]:
        """Gợi ý cá nhân hóa theo đăng ký và hành vi của người này. Chưa có lịch sử thì trả tour đang được quan tâm."""
        key = (email or "").strip().lower()
        past = self.history.get(key)
        if not past:
            return self.popular(limit)

        total = sum(past.values())
        scores = np.zeros(len(self.tours))
        for tour_id, w in past.items():
            scores += w * self.sim[self.index[tour_id]]
        scores = scores / total + POPULARITY_BOOST * self.popularity
        exclude = {self.index[t] for t in self.booked.get(key, set())}

        def reasons(j: int) -> list[str]:
            # Lý do: tour người này từng đặt hoặc quan tâm đóng góp nhiều nhất vào điểm của tour này.
            best = max((t for t in past if self.index[t] != j), key=lambda t: past[t] * self.sim[self.index[t], j], default=None)
            if best is None:
                return ["Có thể bạn quan tâm"]
            verb = "đặt" if best in self.booked.get(key, set()) else "quan tâm"
            return [f"Vì bạn đã {verb} {self.tours[self.index[best]].name}"]

        return self._top(scores, exclude, limit, reasons)

    def popular(self, limit: int) -> list[Recommendation]:
        def reasons(j: int) -> list[str]:
            r = ["Đang được quan tâm"]
            if self.tours[j].review_count > 0 and self.tours[j].avg_rating >= 4.5:
                r.append("Đánh giá cao")
            return r

        return self._top(self.popularity, set(), limit, reasons)
