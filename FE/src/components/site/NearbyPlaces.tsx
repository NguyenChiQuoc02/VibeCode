"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Skeleton, Typography } from "@mui/material";
import PlaceTile from "@/components/site/PlaceTile";
import { SITE } from "@/components/site/tokens";
import { recommendApi } from "@/lib/api";
import { trackEvent } from "@/lib/track";

/** Địa điểm du lịch và di tích lân cận một địa điểm (tính theo tọa độ). Ẩn hẳn khi không có hoặc dịch vụ gợi ý lỗi. */
export default function NearbyPlaces({ placeId, limit = 3 }: { placeId: string; limit?: number }) {
  const enabled = Boolean(process.env.NEXT_PUBLIC_RECOMMEND_API);
  const q = useQuery({ queryKey: ["recommend", "nearby", placeId, limit], queryFn: () => recommendApi.nearby(placeId, limit, 40), enabled, staleTime: 300_000, retry: false });

  const shown = useRef("");
  useEffect(() => {
    if (q.data && q.data.length > 0 && shown.current !== placeId) {
      shown.current = placeId;
      trackEvent({ type: "RECOMMEND_VIEW", source: "nearby", targetId: placeId });
    }
  }, [q.data, placeId]);

  if (!enabled || q.isError || (q.data && q.data.length === 0)) return null;

  return (
    <Box sx={{ mt: 7 }} onClickCapture={() => trackEvent({ type: "RECOMMEND_CLICK", source: "nearby", targetId: placeId })}>
      <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 26, color: SITE.ink, mb: 0.5 }}>Địa điểm lân cận</Typography>
      <Typography sx={{ color: SITE.muted, mb: 3 }}>Những nơi gần đây bạn có thể ghé thăm thêm.</Typography>
      <Box sx={{ display: "grid", gap: 3.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } }}>
        {q.isPending
          ? Array.from({ length: limit }, (_, i) => <Skeleton key={i} variant="rounded" height={340} />)
          : q.data!.map((p) => (
              <PlaceTile key={p.id} kind={p.kind === "landmark" ? "LANDMARK" : "DESTINATION"} id={p.id} title={p.name} image={p.image ?? undefined} location={p.address ?? undefined} badge={`Cách ${p.distanceKm} km`} />
            ))}
      </Box>
    </Box>
  );
}
