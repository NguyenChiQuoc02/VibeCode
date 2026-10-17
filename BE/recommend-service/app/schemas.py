from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


def _camel(s: str) -> str:
    head, *rest = s.split("_")
    return head + "".join(w.capitalize() for w in rest)


class CamelModel(BaseModel):
    """JSON vào/ra dùng camelCase như các service Java để FE xử lý thống nhất."""

    model_config = ConfigDict(alias_generator=_camel, populate_by_name=True)


class RecommendationOut(CamelModel):
    tour_id: str
    name: str
    image: str | None = None
    price: int
    duration_days: int
    start_date: date | None = None
    avg_rating: float
    review_count: int
    score: float
    reasons: list[str]


class NearbyOut(CamelModel):
    id: str
    kind: Literal["destination", "landmark"]
    name: str
    address: str | None = None
    image: str | None = None
    distance_km: float


class StatusOut(CamelModel):
    ready: bool
    built_at: float | None = None
    tours: int
    places: int
    users_with_history: int
    events_enabled: bool


EventType = Literal["VIEW_TOUR", "FAVORITE_TOUR", "VIEW_PLACE", "SEARCH", "RECOMMEND_VIEW", "RECOMMEND_CLICK"]


class EventIn(CamelModel):
    type: EventType
    target_id: str | None = Field(default=None, max_length=64)
    query: str | None = Field(default=None, max_length=200)
    # Khối gợi ý phát sinh sự kiện: similar | for_me | popular | nearby ...
    source: str | None = Field(default=None, max_length=40)
    session_id: str | None = Field(default=None, max_length=64)
