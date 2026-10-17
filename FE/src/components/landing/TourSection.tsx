"use client";

import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Box, Chip, Rating, Stack, Typography } from "@mui/material";
import TourIcon from "@mui/icons-material/Tour";
import EventIcon from "@mui/icons-material/EventOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import PlaceSection, { RAIL_ITEM_SX } from "@/components/landing/PlaceSection";
import FavoriteButton from "@/components/site/FavoriteButton";
import { Tour, tourApi } from "@/lib/api";
import { formatDate, formatVnd, tourAvailability } from "@/lib/tourFormat";

function TourMiniCard({ tour }: { tour: Tour }) {
  const avail = tourAvailability(tour);
  const nights = tour.durationDays - 1;
  return (
    <Box
      component={NextLink}
      href={`/tours/${tour.id}`}
      sx={{
        ...RAIL_ITEM_SX,
        display: "block",
        bgcolor: "#fff",
        borderRadius: 2.5,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        boxShadow: "0 4px 18px rgba(16,40,60,0.1)",
        transition: "transform .15s, box-shadow .15s",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 26px rgba(16,40,60,0.16)" },
      }}
    >
      <Box sx={{ position: "relative", height: 140, background: "linear-gradient(135deg,#BFE8D8,#8FC7E8)" }}>
        {tour.image && <Box component="img" src={tour.image} alt={tour.name} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
        <Box sx={{ position: "absolute", left: 10, bottom: 10, px: 1.25, py: 0.25, borderRadius: 5, fontSize: 10, fontWeight: 700, bgcolor: "rgba(14,150,140,0.9)", color: "#fff" }}>
          {tour.durationDays} ngày{nights > 0 ? ` ${nights} đêm` : ""}
        </Box>
        <Chip size="small" label={avail.label} sx={{ position: "absolute", top: 8, left: 8, height: 20, fontSize: 10, fontWeight: 700, bgcolor: "#fff", color: avail.open ? "#0E7C5B" : "#637381" }} />
        <Box sx={{ position: "absolute", top: 6, right: 6 }}>
          <FavoriteButton type="TOUR" id={tour.id} />
        </Box>
      </Box>
      <Box sx={{ p: 1.75 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, color: "#0B2B26", height: 36, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{tour.name}</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.75, color: "#637381" }}>
          <EventIcon sx={{ fontSize: 13 }} />
          <Typography sx={{ fontSize: 11 }}>Khởi hành {formatDate(tour.startDate)}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25, color: "#637381" }}>
          <GroupsIcon sx={{ fontSize: 13 }} />
          <Typography sx={{ fontSize: 11 }}>{tour.landmarkIds.length + tour.destinationIds.length} điểm tham quan</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 1.25 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#0E7C5B" }}>{formatVnd(tour.price)}</Typography>
          {tour.reviewCount > 0 && <Rating value={tour.avgRating} precision={0.5} readOnly size="small" />}
        </Stack>
      </Box>
    </Box>
  );
}

/** Khu vực "Tour du lịch" ở landing: các tour đang mở nhận đăng ký, khởi hành sớm nhất. */
export default function TourSection() {
  const { data = [] } = useQuery({ queryKey: ["tours", "upcoming"], queryFn: () => tourApi.list({ upcoming: true, limit: 8 }), staleTime: 60_000 });
  if (data.length === 0) return null;
  return (
    <PlaceSection
      id="tours"
      icon={<TourIcon />}
      title="Tour du lịch"
      description="Hành trình trọn gói kết hợp những di tích và điểm đến nổi bật. Đăng ký dễ dàng, thanh toán tiền mặt sau khi kết thúc chuyến đi."
      href="/tours"
    >
      {data.map((t) => (
        <TourMiniCard key={t.id} tour={t} />
      ))}
    </PlaceSection>
  );
}
