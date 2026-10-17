"use client";

import NextLink from "next/link";
import { Box, Rating, Stack, Typography } from "@mui/material";
import EventIcon from "@mui/icons-material/EventOutlined";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import FavoriteButton from "@/components/site/FavoriteButton";
import { SITE } from "@/components/site/tokens";
import { Tour } from "@/lib/api";
import { formatDate, formatVnd, tourAvailability } from "@/lib/tourFormat";

/** Thẻ tour kiểu tạp chí: ảnh lớn phóng nhẹ khi rê chuột, nhãn kính mờ, giá màu san hô. */
export default function TourCard({ tour }: { tour: Tour }) {
  const avail = tourAvailability(tour);
  const places = tour.landmarkIds.length + tour.destinationIds.length;
  const nights = tour.durationDays - 1;
  return (
    <Box
      component={NextLink}
      href={`/tours/${tour.id}`}
      sx={{
        display: "block",
        bgcolor: "#fff",
        borderRadius: `${SITE.radius}px`,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        boxShadow: SITE.shadow,
        transition: "transform .25s, box-shadow .25s",
        "&:hover": { transform: "translateY(-6px)", boxShadow: SITE.shadowHover },
        "&:hover img": { transform: "scale(1.08)" },
      }}
    >
      <Box sx={{ position: "relative", height: 220, overflow: "hidden", background: SITE.gradientSky }}>
        {tour.image && <Box component="img" src={tour.image} alt={tour.name} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .6s ease" }} />}
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.62) 100%)" }} />
        <Box sx={{ position: "absolute", top: 12, left: 12, px: 1.5, py: 0.5, borderRadius: 5, fontSize: 11, fontWeight: 700, color: avail.open ? "#fff" : "#fff", bgcolor: avail.open ? "rgba(14,124,91,0.92)" : "rgba(28,37,46,0.78)", backdropFilter: "blur(6px)" }}>{avail.label}</Box>
        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
          <FavoriteButton type="TOUR" id={tour.id} />
        </Box>
        <Box sx={{ position: "absolute", left: 12, bottom: 12, px: 1.5, py: 0.5, borderRadius: 5, fontSize: 12, fontWeight: 700, color: "#fff", bgcolor: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.35)" }}>
          {tour.durationDays} ngày{nights > 0 ? ` ${nights} đêm` : ""}
        </Box>
      </Box>

      <Box sx={{ p: 2.25 }}>
        <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 18, lineHeight: 1.3, color: SITE.ink, height: 47, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{tour.name}</Typography>

        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 1.25, color: SITE.muted }}>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <EventIcon sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: 12 }}>{formatDate(tour.startDate)}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <PlaceIcon sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: 12 }}>{places} điểm</Typography>
          </Stack>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <GroupsIcon sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: 12 }}>Tối đa {tour.maxParticipants}</Typography>
          </Stack>
        </Stack>

        <Box sx={{ mt: 1.75, pt: 1.5, borderTop: `1px dashed ${SITE.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Box>
            <Typography sx={{ fontSize: 10, color: SITE.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>Chỉ từ</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 20, lineHeight: 1.1, color: SITE.coral }}>{formatVnd(tour.price)}</Typography>
          </Box>
          <Stack alignItems="flex-end">
            <Rating value={tour.avgRating} precision={0.5} readOnly size="small" />
            <Typography sx={{ fontSize: 10.5, color: SITE.muted }}>{tour.reviewCount > 0 ? `${tour.avgRating.toFixed(1)} · ${tour.reviewCount} đánh giá` : "Chưa có đánh giá"}</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
