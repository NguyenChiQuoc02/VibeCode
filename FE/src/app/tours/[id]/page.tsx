"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Chip, CircularProgress, Rating, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/EventOutlined";
import ScheduleIcon from "@mui/icons-material/ScheduleOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import FavoriteButton from "@/components/site/FavoriteButton";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { SITE } from "@/components/site/tokens";
import BookingPanel from "@/components/tour/BookingPanel";
import Itinerary from "@/components/tour/Itinerary";
import PlaceStrip from "@/components/tour/PlaceStrip";
import ReviewSection from "@/components/tour/ReviewSection";
import RecommendedTours from "@/components/tour/RecommendedTours";
import { tourApi } from "@/lib/api";
import { trackEvent } from "@/lib/track";
import { formatDate, tourAvailability } from "@/lib/tourFormat";

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, borderRadius: 4, bgcolor: "#fff", boxShadow: "0 4px 16px rgba(11,61,53,0.07)" }}>
      <Box sx={{ width: 42, height: 42, borderRadius: 3, display: "grid", placeItems: "center", color: SITE.brand, bgcolor: "rgba(14,124,91,0.1)", "& svg": { fontSize: 22 } }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: 11, color: SITE.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: SITE.ink }}>{value}</Typography>
      </Box>
    </Stack>
  );
}

/** Chi tiết tour công khai: ai cũng xem được; đăng ký và yêu thích cần đăng nhập. */
export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tour, isPending, error } = useQuery({ queryKey: ["tour", id], queryFn: () => tourApi.get(id) });

  // Ghi nhận lượt xem tour để hệ thống gợi ý học sở thích.
  useEffect(() => {
    if (tour?.id) trackEvent({ type: "VIEW_TOUR", targetId: tour.id });
  }, [tour?.id]);
  const avail = tour ? tourAvailability(tour) : null;
  const nights = tour ? tour.durationDays - 1 : 0;

  return (
    <SiteShell>
      {isPending && (
        <Box sx={{ pt: 20, textAlign: "center", minHeight: 500 }}>
          <CircularProgress sx={{ color: SITE.brand }} />
        </Box>
      )}
      {error && (
        <SiteContainer sx={{ pt: 16 }}>
          <Alert severity="error">{(error as Error).message}</Alert>
        </SiteContainer>
      )}

      {tour && avail && (
        <>
          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 380, md: 460 },
              display: "flex",
              alignItems: "flex-end",
              color: "#fff",
              backgroundColor: SITE.brandDark,
              backgroundImage: `linear-gradient(180deg, rgba(4,28,25,0.5) 0%, rgba(4,28,25,0.1) 40%, rgba(4,28,25,0.85) 100%)${tour.image ? `, url("${tour.image}")` : `, ${SITE.gradientBrand}`}`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <Box sx={{ maxWidth: 1280, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, pb: { xs: 4, md: 6 }, pt: 14 }}>
              <Box component={NextLink} href="/tours" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mb: 2, px: 1.75, py: 0.6, borderRadius: 5, fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none", bgcolor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
                <ArrowBackIcon sx={{ fontSize: 16 }} /> Tất cả tour
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                <Chip size="small" label={avail.label} sx={{ fontWeight: 700, color: "#fff", bgcolor: avail.open ? "rgba(14,124,91,0.95)" : "rgba(28,37,46,0.8)" }} />
                <Chip size="small" label={`${tour.durationDays} ngày${nights > 0 ? ` ${nights} đêm` : ""}`} sx={{ fontWeight: 700, color: "#fff", bgcolor: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)" }} />
                {tour.reviewCount > 0 && (
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ px: 1.25, py: 0.25, borderRadius: 5, bgcolor: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)" }}>
                    <Rating value={tour.avgRating} precision={0.5} readOnly size="small" />
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                      {tour.avgRating.toFixed(1)} ({tour.reviewCount})
                    </Typography>
                  </Stack>
                )}
              </Stack>
              <Typography component="h1" sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: { xs: 30, md: 46 }, lineHeight: 1.15, maxWidth: 860, textShadow: "0 3px 18px rgba(0,0,0,0.5)" }}>
                {tour.name}
              </Typography>
              <Box sx={{ mt: 2.5 }}>
                <FavoriteButton type="TOUR" id={tour.id} variant="pill" />
              </Box>
            </Box>
          </Box>

          <SiteContainer sx={{ mt: { xs: 3, md: -5 }, position: "relative", zIndex: 2 }}>
            <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1fr 380px" }, alignItems: "start" }}>
              <Stack spacing={5} sx={{ minWidth: 0, pt: { md: 7 } }}>
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
                  <Fact icon={<EventIcon />} label="Khởi hành" value={formatDate(tour.startDate)} />
                  <Fact icon={<ScheduleIcon />} label="Kết thúc" value={`${formatDate(tour.endDate)} · ${tour.durationDays} ngày`} />
                  <Fact icon={<GroupsIcon />} label="Số chỗ" value={`Tối đa ${tour.maxParticipants} người`} />
                  <Fact icon={<PaymentsOutlinedIcon />} label="Thanh toán" value="Tiền mặt sau chuyến đi" />
                </Box>

                {tour.summary && <Typography sx={{ fontFamily: SITE.serif, fontSize: { xs: 18, md: 21 }, lineHeight: 1.7, color: SITE.ink, whiteSpace: "pre-wrap" }}>{tour.summary}</Typography>}

                {tour.itinerary && (
                  <Box>
                    <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 24, color: SITE.ink, mb: 2.5 }}>Lịch trình chi tiết</Typography>
                    <Itinerary text={tour.itinerary} />
                  </Box>
                )}

                <PlaceStrip title="Di tích, danh lam thắng cảnh trong tour" kind="landmarks" places={tour.landmarks} />
                <PlaceStrip title="Địa điểm du lịch trong tour" kind="destinations" places={tour.destinations} />

                <ReviewSection tour={tour} />
              </Stack>

              <BookingPanel tour={tour} />
            </Box>
            <Box sx={{ mt: 8, mb: 8 }}>
              <RecommendedTours title="Tour tương tự" subtitle="Cùng điểm đến, gần khu vực này hoặc được nhiều khách đặt cùng." source="similar" tourId={tour.id} />
            </Box>
          </SiteContainer>
        </>
      )}
    </SiteShell>
  );
}
