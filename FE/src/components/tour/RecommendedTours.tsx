"use client";

import { useEffect, useRef } from "react";
import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Box, Chip, Rating, Skeleton, Stack, Typography } from "@mui/material";
import { SITE } from "@/components/site/tokens";
import { RecommendedTour, recommendApi } from "@/lib/api";
import { trackEvent } from "@/lib/track";
import { formatDate, formatVnd } from "@/lib/tourFormat";

export type RecommendSource = "similar" | "for_me" | "popular";

interface Props {
  title: string;
  subtitle?: string;
  source: RecommendSource;
  /** Bắt buộc khi source = "similar": tour làm gốc để tìm tour tương tự. */
  tourId?: string;
  limit?: number;
}

function Card({ item, source }: { item: RecommendedTour; source: RecommendSource }) {
  return (
    <Box
      component={NextLink}
      href={`/tours/${item.tourId}`}
      onClick={() => trackEvent({ type: "RECOMMEND_CLICK", targetId: item.tourId, source })}
      sx={{
        display: "block",
        bgcolor: "#fff",
        borderRadius: 4,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        boxShadow: SITE.shadow,
        transition: "transform .25s, box-shadow .25s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: SITE.shadowHover },
      }}
    >
      <Box sx={{ height: 150, background: SITE.gradientSky }}>
        {item.image && <Box component="img" src={item.image} alt={item.name} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 700, color: SITE.ink, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 42 }}>{item.name}</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.75 }}>
          <Rating value={item.avgRating} precision={0.1} readOnly size="small" />
          <Typography sx={{ fontSize: 12, color: SITE.muted }}>({item.reviewCount})</Typography>
        </Stack>
        <Typography sx={{ mt: 0.75, fontSize: 12.5, color: SITE.muted }}>
          {item.startDate ? `Khởi hành ${formatDate(item.startDate)} · ` : ""}
          {item.durationDays} ngày
        </Typography>
        <Typography sx={{ mt: 0.5, fontWeight: 800, color: SITE.coral }}>{formatVnd(item.price)}</Typography>
        {item.reasons.length > 0 && (
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5} sx={{ mt: 1 }}>
            {item.reasons.slice(0, 2).map((r) => (
              <Chip key={r} label={r} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: SITE.mist, color: SITE.brandDark }} />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

/** Khối tour gợi ý. Ghi nhận lượt hiển thị và lượt bấm để đo hiệu quả gợi ý. Ẩn hẳn khi chưa có gợi ý hoặc dịch vụ gợi ý lỗi. */
export default function RecommendedTours({ title, subtitle, source, tourId, limit = 4 }: Props) {
  const enabled = Boolean(process.env.NEXT_PUBLIC_RECOMMEND_API) && (source !== "similar" || Boolean(tourId));
  const q = useQuery({
    queryKey: ["recommend", source, tourId ?? "", limit],
    queryFn: () => (source === "similar" ? recommendApi.similar(tourId!, limit) : source === "for_me" ? recommendApi.forMe(limit) : recommendApi.popular(limit)),
    enabled,
    staleTime: 120_000,
    retry: false,
  });

  // Mỗi lần hiển thị bộ gợi ý mới chỉ ghi một lượt hiển thị.
  const shown = useRef<string>("");
  useEffect(() => {
    const key = `${source}:${tourId ?? ""}:${q.data?.map((r) => r.tourId).join(",")}`;
    if (q.data && q.data.length > 0 && shown.current !== key) {
      shown.current = key;
      trackEvent({ type: "RECOMMEND_VIEW", source, targetId: tourId });
    }
  }, [q.data, source, tourId]);

  if (!enabled || q.isError || (q.data && q.data.length === 0)) return null;

  return (
    <Box>
      <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 24, color: SITE.ink }}>{title}</Typography>
      {subtitle && <Typography sx={{ color: SITE.muted, mt: 0.5 }}>{subtitle}</Typography>}
      <Box sx={{ mt: 2.5, display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: `repeat(${Math.min(limit, 4)}, 1fr)` } }}>
        {q.isPending ? Array.from({ length: Math.min(limit, 4) }, (_, i) => <Skeleton key={i} variant="rounded" height={300} />) : q.data!.map((it) => <Card key={it.tourId} item={it} source={source} />)}
      </Box>
    </Box>
  );
}
