"use client";

import PageTitle from "@/components/PageTitle";
import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Autocomplete, Box, Card, CircularProgress, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import { destinationApi, geoApi, landmarkApi, Province, Ward } from "@/lib/api";
import type { MapMarker } from "@/components/MapView";

// Leaflet dùng window nên chỉ render ở client.
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
      <CircularProgress />
    </Box>
  ),
});

export default function MapPage() {
  // useSearchParams cần Suspense.
  return (
    <Suspense>
      <MapContent />
    </Suspense>
  );
}

function MapContent() {
  const params = useSearchParams();
  const focusLat = Number(params.get("lat"));
  const focusLng = Number(params.get("lng"));
  const initialFocus: [number, number] | null = params.get("lat") && params.get("lng") && !Number.isNaN(focusLat) && !Number.isNaN(focusLng) ? [focusLat, focusLng] : null;
  const [focus, setFocus] = useState(initialFocus);
  const [province, setProvince] = useState<Province | null>(null);
  const [ward, setWard] = useState<Ward | null>(null);
  const [showLandmarks, setShowLandmarks] = useState(params.get("landmarks") === "1");
  const [showDestinations, setShowDestinations] = useState(params.get("destinations") === "1");

  const provincesQ = useQuery({ queryKey: ["provinces", "geometry"], queryFn: () => geoApi.provinces(true), staleTime: Infinity });
  const wardsQ = useQuery({
    queryKey: ["wards", province?.code, "geometry"],
    queryFn: () => geoApi.wards(province!.code, true),
    enabled: province !== null,
    staleTime: Infinity,
  });
  const landmarksQ = useQuery({ queryKey: ["landmarks"], queryFn: landmarkApi.markers, enabled: showLandmarks });
  const destinationsQ = useQuery({ queryKey: ["destinations"], queryFn: destinationApi.list, enabled: showDestinations });

  const provinces = provincesQ.data ?? [];

  // Mở từ trang chi tiết di tích: chọn sẵn tỉnh theo ?province=.
  const wantedProvince = Number(params.get("province"));
  useEffect(() => {
    if (wantedProvince && province === null && provinces.length > 0) setProvince(provinces.find((p) => p.code === wantedProvince) ?? null);
    // chỉ chạy khi danh sách tỉnh vừa tải xong
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinces.length]);
  const wards = wardsQ.data ?? [];

  const markers = useMemo<MapMarker[]>(() => {
    const result: MapMarker[] = [];
    if (showLandmarks) for (const l of landmarksQ.data ?? []) result.push({ id: `l-${l.id}`, name: l.name, category: l.category, address: l.address, latitude: l.latitude, longitude: l.longitude, color: "#FFAB00" });
    if (showDestinations) for (const d of destinationsQ.data ?? []) result.push({ id: `d-${d.id}`, name: d.name, category: d.type, address: d.address, latitude: d.latitude, longitude: d.longitude, color: "#00B8D9" });
    return result;
  }, [showLandmarks, showDestinations, landmarksQ.data, destinationsQ.data]);

  const selectProvince = (p: Province | null) => {
    setFocus(null);
    setProvince(p);
    setWard(null);
  };

  const error = provincesQ.error ?? wardsQ.error;

  return (
    <>
      <PageTitle />

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }} alignItems={{ md: "center" }}>
        <Autocomplete
          sx={{ minWidth: 260 }}
          options={provinces}
          value={province}
          loading={provincesQ.isPending}
          getOptionLabel={(p) => p.name}
          isOptionEqualToValue={(a, b) => a.code === b.code}
          onChange={(_, p) => selectProvince(p)}
          renderInput={(params) => <TextField {...params} label="Tỉnh / Thành phố" />}
          noOptionsText="Không có kết quả"
        />
        <Autocomplete
          sx={{ minWidth: 260 }}
          options={wards}
          value={ward}
          disabled={province === null}
          loading={wardsQ.isFetching}
          getOptionLabel={(w) => w.name}
          isOptionEqualToValue={(a, b) => a.code === b.code}
          onChange={(_, w) => {
            setFocus(null);
            setWard(w);
          }}
          renderInput={(params) => <TextField {...params} label="Xã / Phường" />}
          noOptionsText="Không có kết quả"
        />
        <FormControlLabel control={<Switch checked={showLandmarks} onChange={(e) => setShowLandmarks(e.target.checked)} />} label="Di tích" />
        <FormControlLabel control={<Switch checked={showDestinations} onChange={(e) => setShowDestinations(e.target.checked)} />} label="Địa điểm du lịch" />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}

      <Card sx={{ height: "calc(100vh - 300px)", minHeight: 420, p: 1 }}>
        <MapView
          provinces={provinces}
          wards={wards}
          provinceCode={province?.code ?? null}
          wardCode={ward?.code ?? null}
          markers={markers}
          focus={focus}
          onSelectProvince={(code) => selectProvince(provinces.find((p) => p.code === code) ?? null)}
          onSelectWard={(code) => {
            setFocus(null);
            setWard(wards.find((w) => w.code === code) ?? null);
          }}
        />
      </Card>
    </>
  );
}
