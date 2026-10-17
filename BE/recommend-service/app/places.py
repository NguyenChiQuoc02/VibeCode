"""Tìm địa điểm lân cận (địa điểm du lịch và di tích) theo tọa độ."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class Place:
    id: str
    kind: str  # "destination" | "landmark"
    name: str
    address: str | None
    image: str | None
    lat: float
    lng: float


class PlaceIndex:
    def __init__(self, places: list[Place]):
        self.places = places
        self.by_id = {p.id: p for p in places}
        self._lat = np.radians(np.array([p.lat for p in places], dtype=float))
        self._lng = np.radians(np.array([p.lng for p in places], dtype=float))

    @staticmethod
    def from_api(destinations: list[dict], landmark_markers: list[dict]) -> "PlaceIndex":
        places: list[Place] = []
        for d in destinations:
            if d.get("latitude") is not None and d.get("longitude") is not None:
                places.append(Place(d["id"], "destination", d.get("name") or "", d.get("address"), d.get("urlImage"), d["latitude"], d["longitude"]))
        for m in landmark_markers:
            if m.get("latitude") is not None and m.get("longitude") is not None:
                places.append(Place(m["id"], "landmark", m.get("name") or "", m.get("address"), None, m["latitude"], m["longitude"]))
        return PlaceIndex(places)

    def geo(self) -> dict[str, tuple[float, float]]:
        return {p.id: (p.lat, p.lng) for p in self.places}

    def nearby(self, lat: float, lng: float, limit: int, radius_km: float, exclude_id: str | None = None) -> list[tuple[Place, float]]:
        """Địa điểm trong bán kính radius_km, gần nhất trước. Trả [(địa điểm, khoảng cách km)]."""
        if not self.places:
            return []
        la, lo = np.radians(lat), np.radians(lng)
        a = np.sin((self._lat - la) / 2) ** 2 + np.cos(la) * np.cos(self._lat) * np.sin((self._lng - lo) / 2) ** 2
        dist = 2 * 6371.0 * np.arcsin(np.sqrt(a))
        out: list[tuple[Place, float]] = []
        for j in np.argsort(dist):
            if dist[j] > radius_km or len(out) >= limit:
                break
            p = self.places[int(j)]
            if p.id != exclude_id:
                out.append((p, round(float(dist[j]), 1)))
        return out
