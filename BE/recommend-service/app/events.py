"""Lưu và tổng hợp sự kiện hành vi người dùng (xem tour, yêu thích, tìm kiếm, bấm vào gợi ý) trong MongoDB riêng của service."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from pymongo import AsyncMongoClient

from app.config import Settings

# VIEW_TOUR, FAVORITE_TOUR, VIEW_PLACE, SEARCH, RECOMMEND_VIEW (khối gợi ý được hiển thị), RECOMMEND_CLICK (bấm vào một gợi ý).
EVENT_TYPES = {"VIEW_TOUR", "FAVORITE_TOUR", "VIEW_PLACE", "SEARCH", "RECOMMEND_VIEW", "RECOMMEND_CLICK"}
NEEDS_TARGET = {"VIEW_TOUR", "FAVORITE_TOUR", "VIEW_PLACE", "RECOMMEND_CLICK"}
SIGNAL_TYPES = ["VIEW_TOUR", "FAVORITE_TOUR", "RECOMMEND_CLICK"]


class EventStore:
    def __init__(self, settings: Settings):
        self._client = AsyncMongoClient(settings.mongo_uri, serverSelectionTimeoutMS=3000)
        self._col = self._client[settings.mongo_db]["events"]

    async def close(self) -> None:
        await self._client.close()

    async def ensure_indexes(self) -> None:
        await self._col.create_index([("userEmail", 1), ("type", 1), ("createdAt", -1)])
        await self._col.create_index([("type", 1), ("createdAt", -1)])

    async def add(self, doc: dict) -> None:
        doc["createdAt"] = datetime.now(timezone.utc)
        await self._col.insert_one(doc)

    async def signals(self, days: int = 90) -> list[dict]:
        """Sự kiện của người dùng đã đăng nhập, gộp theo (email, tour, loại) để đưa vào mô hình."""
        since = datetime.now(timezone.utc) - timedelta(days=days)
        pipeline = [
            {"$match": {"createdAt": {"$gte": since}, "type": {"$in": SIGNAL_TYPES}, "userEmail": {"$ne": None}, "targetId": {"$ne": None}}},
            {"$group": {"_id": {"email": "$userEmail", "tourId": "$targetId", "type": "$type"}, "count": {"$sum": 1}}},
        ]
        return [{**r["_id"], "count": r["count"]} async for r in await self._col.aggregate(pipeline)]

    async def metrics(self, days: int = 30) -> dict:
        """Số sự kiện theo loại và hiệu quả khối gợi ý (tỷ lệ bấm = lượt bấm / lượt hiển thị) theo nguồn."""
        since = datetime.now(timezone.utc) - timedelta(days=days)
        by_type = {r["_id"]: r["n"] async for r in await self._col.aggregate([{"$match": {"createdAt": {"$gte": since}}}, {"$group": {"_id": "$type", "n": {"$sum": 1}}}])}
        by_source: dict[str, dict[str, int]] = {}
        pipeline = [
            {"$match": {"createdAt": {"$gte": since}, "type": {"$in": ["RECOMMEND_VIEW", "RECOMMEND_CLICK"]}}},
            {"$group": {"_id": {"source": {"$ifNull": ["$source", "khác"]}, "type": "$type"}, "n": {"$sum": 1}}},
        ]
        async for r in await self._col.aggregate(pipeline):
            by_source.setdefault(r["_id"]["source"], {})[r["_id"]["type"]] = r["n"]
        sources = []
        for name, c in sorted(by_source.items()):
            views, clicks = c.get("RECOMMEND_VIEW", 0), c.get("RECOMMEND_CLICK", 0)
            sources.append({"source": name, "views": views, "clicks": clicks, "clickRate": round(clicks / views, 4) if views else 0.0})
        return {"days": days, "byType": by_type, "recommendSources": sources}
