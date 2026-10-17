"use client";

import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, Marker, Popup, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { LatLngBoundsExpression, PathOptions } from "leaflet";
import type { Feature, Geometry } from "geojson";
import "leaflet/dist/leaflet.css";
import { Province, Ward } from "@/lib/api";
import BaseTileLayer from "@/components/BaseTileLayer";

const VIETNAM_BOUNDS: LatLngBoundsExpression = [
  [8.4, 102.1],
  [23.4, 109.5],
];

const PRIMARY = "#00A76F";

export interface MapMarker {
  id: string;
  name: string;
  category: string;
  address?: string;
  latitude: number;
  longitude: number;
  color: string;
}

interface Props {
  provinces: Province[];
  wards: Ward[];
  provinceCode: number | null;
  wardCode: number | null;
  markers: MapMarker[];
  /** Tọa độ cần đưa vào giữa bản đồ (vd từ trang chi tiết di tích). */
  focus?: [number, number] | null;
  onSelectProvince: (code: number) => void;
  onSelectWard: (code: number) => void;
}

type Unit = Province | Ward;

// bbox của BE là [minLng, minLat, maxLng, maxLat], Leaflet cần [[lat, lng], [lat, lng]].
function toBounds(bbox?: number[]): LatLngBoundsExpression {
  if (!bbox) return VIETNAM_BOUNDS;
  return [
    [bbox[1], bbox[0]],
    [bbox[3], bbox[2]],
  ];
}

const iconCache = new Map<string, L.DivIcon>();

/** Ghim bản đồ (SVG) theo màu; dùng chung một icon cho mọi marker cùng màu. */
function pinIcon(color: string): L.DivIcon {
  let icon = iconCache.get(color);
  if (!icon) {
    icon = L.divIcon({
      className: "vj-pin",
      html: `<svg width="28" height="36" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg"><path d="M13 1C6.4 1 1 6.4 1 13c0 9 12 20 12 20s12-11 12-20C25 6.4 19.6 1 13 1z" fill="${color}" stroke="#fff" stroke-width="1.6"/><circle cx="13" cy="13" r="4.6" fill="#fff"/></svg>`,
      iconSize: [28, 36],
      iconAnchor: [14, 35],
      popupAnchor: [0, -32],
    });
    iconCache.set(color, icon);
  }
  return icon;
}

const FULL_DETAIL_ZOOM = 12;

/**
 * Chỉ vẽ ghim trong khung nhìn. Khi thu nhỏ thì mỗi ô lưới chỉ hiện một ghim (ô càng nhỏ khi phóng to),
 * nhờ vậy hàng nghìn điểm vẫn mượt; phóng đến mức chi tiết thì hiện đủ mọi ghim.
 */
function PinLayer({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  const [view, setView] = useState(() => ({ bounds: map.getBounds(), zoom: map.getZoom() }));
  useMapEvents({
    moveend: () => setView({ bounds: map.getBounds(), zoom: map.getZoom() }),
  });

  const { shown, hidden } = useMemo(() => {
    const padded = view.bounds.pad(0.2);
    const visible = markers.filter((m) => padded.contains([m.latitude, m.longitude]));
    if (view.zoom >= FULL_DETAIL_ZOOM) return { shown: visible, hidden: 0 };
    // Kích thước ô lưới (độ) giảm một nửa mỗi mức phóng.
    const cell = 3.2 / 2 ** (view.zoom - 5);
    const seen = new Set<string>();
    const picked: MapMarker[] = [];
    for (const m of visible) {
      const key = `${Math.floor(m.latitude / cell)}:${Math.floor(m.longitude / cell)}:${m.color}`;
      if (!seen.has(key)) {
        seen.add(key);
        picked.push(m);
      }
    }
    return { shown: picked, hidden: visible.length - picked.length };
  }, [markers, view]);

  return (
    <>
      {shown.map((m) => (
        <Marker key={m.id} position={[m.latitude, m.longitude]} icon={pinIcon(m.color)}>
          <Popup>
            <strong>{m.name}</strong>
            <br />
            {m.category}
            {m.address && (
              <>
                <br />
                {m.address}
              </>
            )}
          </Popup>
        </Marker>
      ))}
      {hidden > 0 && (
        <div style={{ position: "absolute", left: 12, bottom: 12, zIndex: 1000, padding: "6px 12px", borderRadius: 16, background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", fontSize: 12, color: "#1C252E" }}>
          Phóng to để xem thêm {hidden.toLocaleString("vi-VN")} điểm
        </div>
      )}
    </>
  );
}

function FitBounds({ bounds, focus }: { bounds: LatLngBoundsExpression; focus?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.setView(focus, 13);
    else map.fitBounds(bounds, { padding: [24, 24] });
  }, [map, bounds, focus]);
  return null;
}

function units(list: Unit[], selectedCode: number | null, onClick: (code: number) => void, base: PathOptions, selected: PathOptions) {
  return list
    .filter((u) => u.geometry)
    .map((u) => {
      const feature: Feature<Geometry> = { type: "Feature", properties: {}, geometry: u.geometry as unknown as Geometry };
      const isSelected = u.code === selectedCode;
      // key gồm trạng thái chọn để GeoJSON được vẽ lại khi đổi style.
      return (
        <GeoJSON
          key={`${u.code}-${isSelected}`}
          data={feature}
          style={isSelected ? selected : base}
          eventHandlers={{ click: () => onClick(u.code) }}
        >
          <Tooltip sticky>{u.name}</Tooltip>
        </GeoJSON>
      );
    });
}

export default function MapView({ provinces, wards, provinceCode, wardCode, markers, focus, onSelectProvince }: Props) {
  const province = provinces.find((p) => p.code === provinceCode);
  const ward = wards.find((w) => w.code === wardCode);
  const bbox = (ward ?? province)?.bbox;
  // Giữ nguyên tham chiếu để bản đồ không bị zoom lại mỗi lần render (vd khi bật/tắt marker).
  const bounds = useMemo(() => toBounds(bbox), [bbox]);

  return (
    <MapContainer preferCanvas bounds={VIETNAM_BOUNDS} style={{ height: "100%", width: "100%", borderRadius: 12 }} scrollWheelZoom>
      <BaseTileLayer />
      <FitBounds bounds={bounds} focus={focus} />

      {provinceCode === null &&
        units(provinces, null, onSelectProvince, { color: PRIMARY, weight: 1.5, fillColor: PRIMARY, fillOpacity: 0.12 }, {})}

      {provinceCode !== null && province && (
        <>
          {units([province], null, () => {}, { color: "#007867", weight: 3, fill: false, interactive: false }, {})}
          {/* Ranh giới phường chỉ hiện khi tìm và chọn phường trong ô tìm kiếm, không vẽ cả tỉnh */}
          {ward && units([ward], null, () => {}, { color: "#FF5630", weight: 3, fillColor: "#FF5630", fillOpacity: 0.3, interactive: false }, {})}
        </>
      )}

      <PinLayer markers={markers} />
    </MapContainer>
  );
}
