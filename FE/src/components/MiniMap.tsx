"use client";

import { CircleMarker, MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import BaseTileLayer from "@/components/BaseTileLayer";

/** Bản đồ nhỏ đánh dấu một vị trí, không cho cuộn bằng chuột để khỏi vướng khi cuộn trang. */
export default function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer center={[lat, lng]} zoom={10} scrollWheelZoom={false} style={{ height: "100%", width: "100%", borderRadius: 8 }}>
      <BaseTileLayer />
      <CircleMarker center={[lat, lng]} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: "#FF5630", fillOpacity: 1 }} />
    </MapContainer>
  );
}
