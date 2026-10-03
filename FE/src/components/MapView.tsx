"use client";

import { useEffect, useMemo } from "react";
import { CircleMarker, GeoJSON, MapContainer, Popup, Tooltip, useMap } from "react-leaflet";
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

export default function MapView({ provinces, wards, provinceCode, wardCode, markers, focus, onSelectProvince, onSelectWard }: Props) {
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
          {units(
            wards,
            wardCode,
            onSelectWard,
            { color: PRIMARY, weight: 1, fillColor: PRIMARY, fillOpacity: 0.12 },
            { color: "#FF5630", weight: 3, fillColor: "#FF5630", fillOpacity: 0.35 }
          )}
        </>
      )}

      {markers.map((l) => (
        <CircleMarker key={l.id} center={[l.latitude, l.longitude]} radius={4} pathOptions={{ color: "#fff", weight: 1, fillColor: l.color, fillOpacity: 1 }}>
          <Popup>
            <strong>{l.name}</strong>
            <br />
            {l.category}
            {l.address && (
              <>
                <br />
                {l.address}
              </>
            )}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
