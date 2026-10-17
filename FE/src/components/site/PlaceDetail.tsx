"use client";

import { ReactNode, useEffect, useState } from "react";
import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ImageLightbox from "@/components/ImageLightbox";
import FavoriteButton from "@/components/site/FavoriteButton";
import NearbyPlaces from "@/components/site/NearbyPlaces";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { SITE } from "@/components/site/tokens";
import TourCard from "@/components/tour/TourCard";
import { tourApi } from "@/lib/api";
import { trackEvent } from "@/lib/track";

interface Props {
  kind: "LANDMARK" | "DESTINATION";
  id: string;
  title: string;
  backHref: string;
  backLabel: string;
  heroImage?: string;
  chips: string[];
  address?: string;
  /** Mô tả ngắn, hiện chữ lớn dưới ảnh bìa. */
  lead?: string;
  gallery?: string[];
  mapHref?: string;
  /** Các khối nội dung riêng của từng loại. */
  children?: ReactNode;
}

/** Khung trang chi tiết địa điểm: ảnh bìa, thông tin, thư viện ảnh và các tour đi qua địa điểm này. */
export default function PlaceDetail({ kind, id, title, backHref, backLabel, heroImage, chips, address, lead, gallery = [], mapHref, children }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  // Ghi nhận lượt xem địa điểm cho hệ thống gợi ý.
  useEffect(() => {
    trackEvent({ type: "VIEW_PLACE", targetId: id });
  }, [id]);
  const tours = useQuery({ queryKey: ["tours", "place", id], queryFn: () => tourApi.list({ placeId: id, upcoming: true, limit: 6 }) });

  return (
    <SiteShell>
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 360, md: 440 },
          display: "flex",
          alignItems: "flex-end",
          color: "#fff",
          backgroundColor: SITE.brandDark,
          backgroundImage: `linear-gradient(180deg, rgba(4,28,25,0.5) 0%, rgba(4,28,25,0.1) 40%, rgba(4,28,25,0.85) 100%)${heroImage ? `, url("${heroImage}")` : `, ${SITE.gradientBrand}`}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box sx={{ maxWidth: 1280, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, pb: { xs: 4, md: 6 }, pt: 14 }}>
          <Box component={NextLink} href={backHref} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mb: 2, px: 1.75, py: 0.6, borderRadius: 5, fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none", bgcolor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} /> {backLabel}
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            {chips.filter(Boolean).map((c) => (
              <Chip key={c} size="small" label={c} sx={{ fontWeight: 700, color: "#fff", bgcolor: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)" }} />
            ))}
          </Stack>
          <Typography component="h1" sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: { xs: 30, md: 46 }, lineHeight: 1.15, maxWidth: 860, textShadow: "0 3px 18px rgba(0,0,0,0.5)" }}>
            {title}
          </Typography>
          {address && (
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.25, opacity: 0.95 }}>
              <PlaceIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: 15 }}>{address}</Typography>
            </Stack>
          )}
          <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
            <FavoriteButton type={kind} id={id} variant="pill" />
            {mapHref && (
              <Button component={NextLink} href={mapHref} startIcon={<MapOutlinedIcon />} sx={{ px: 2.25, height: 40, borderRadius: 5, fontSize: 13, color: SITE.ink, bgcolor: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", boxShadow: "0 6px 18px rgba(0,0,0,0.18)", "&:hover": { bgcolor: "#fff" } }}>
                Xem trên bản đồ
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      <SiteContainer sx={{ pt: 6 }}>
        <Stack spacing={5} sx={{ maxWidth: 980 }}>
          {lead && <Typography sx={{ fontFamily: SITE.serif, fontSize: { xs: 19, md: 23 }, lineHeight: 1.7, color: SITE.ink }}>{lead}</Typography>}

          {children}

          {gallery.length > 1 && (
            <Box>
              <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 24, color: SITE.ink, mb: 2 }}>Hình ảnh</Typography>
              <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" } }}>
                {gallery.slice(0, 6).map((src, i) => (
                  <Box key={src} onClick={() => setLightbox(i)} sx={{ position: "relative", height: 180, borderRadius: 3, overflow: "hidden", cursor: "zoom-in", background: SITE.gradientSky, "&:hover img": { transform: "scale(1.08)" } }}>
                    <Box component="img" src={src} alt={`${title} ${i + 1}`} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease" }} />
                  </Box>
                ))}
              </Box>
              <ImageLightbox images={gallery.slice(0, 6)} index={lightbox} onClose={() => setLightbox(null)} onIndexChange={setLightbox} caption={title} />
            </Box>
          )}
        </Stack>

        {(tours.data?.length ?? 0) > 0 && (
          <Box sx={{ mt: 7 }}>
            <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 26, color: SITE.ink, mb: 0.5 }}>Tour đi qua địa điểm này</Typography>
            <Typography sx={{ color: SITE.muted, mb: 3 }}>Đăng ký một chuyến đi để trực tiếp trải nghiệm.</Typography>
            <Box sx={{ display: "grid", gap: 3.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } }}>
              {tours.data!.map((t) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </Box>
          </Box>
        )}

        <NearbyPlaces placeId={id} />
      </SiteContainer>
    </SiteShell>
  );
}

/** Một dòng thông tin dạng nhãn - giá trị trong khối "Thông tin nhanh". */
export function InfoGrid({ items }: { items: [string, string | undefined][] }) {
  const shown = items.filter(([, v]) => v);
  if (shown.length === 0) return null;
  return (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" } }}>
      {shown.map(([label, value]) => (
        <Box key={label} sx={{ p: 2, borderRadius: 4, bgcolor: "#fff", boxShadow: "0 4px 16px rgba(11,61,53,0.07)" }}>
          <Typography sx={{ fontSize: 11, color: SITE.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</Typography>
          <Typography sx={{ mt: 0.25, fontWeight: 700, color: SITE.ink }}>{value}</Typography>
        </Box>
      ))}
    </Box>
  );
}
