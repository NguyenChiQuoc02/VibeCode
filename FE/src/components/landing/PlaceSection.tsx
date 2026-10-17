"use client";

import { ReactNode, useRef } from "react";
import NextLink from "next/link";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StarIcon from "@mui/icons-material/Star";
import { PlaceCard, Tone } from "@/components/landing/featured";
import FavoriteButton from "@/components/site/FavoriteButton";
import { BRAND } from "@/components/landing/LandingHeader";

const TONES: Record<Tone, { bg: string; color: string }> = {
  teal: { bg: "rgba(14,150,140,0.9)", color: "#fff" },
  coral: { bg: "rgba(244,140,130,0.92)", color: "#fff" },
  amber: { bg: "rgba(250,196,70,0.95)", color: "#5A3B00" },
  green: { bg: "rgba(60,190,140,0.92)", color: "#fff" },
  purple: { bg: "rgba(130,100,220,0.92)", color: "#fff" },
};

/** Kích thước và căn lề của một thẻ trong hàng cuộn ngang (4 thẻ mỗi hàng trên màn rộng). */
export const RAIL_ITEM_SX = {
  flex: { xs: "0 0 82%", sm: "0 0 calc((100% - 20px) / 2)", md: "0 0 calc((100% - 60px) / 4)" },
  scrollSnapAlign: "start",
};

function Card({ place }: { place: PlaceCard }) {
  const tone = TONES[place.tone];
  return (
    <Box
      component={NextLink}
      href={`/explore/${place.kind === "LANDMARK" ? "landmarks" : "destinations"}/${place.key}`}
      sx={{
        ...RAIL_ITEM_SX,
        display: "block",
        textDecoration: "none",
        color: "inherit",
        bgcolor: "#fff",
        borderRadius: 2.5,
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(16,40,60,0.1)",
        transition: "transform .15s, box-shadow .15s",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 26px rgba(16,40,60,0.16)" },
      }}
    >
      <Box sx={{ position: "relative", height: 140, bgcolor: "#CFE8E0" }}>
        {place.image && <Box component="img" src={place.image} alt={place.title} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <FavoriteButton type={place.kind} id={place.key} />
        </Box>
        <Box sx={{ position: "absolute", left: 10, bottom: 10, px: 1.25, py: 0.25, borderRadius: 5, fontSize: 10, fontWeight: 700, bgcolor: tone.bg, color: tone.color }}>{place.badge}</Box>
      </Box>
      <Box sx={{ p: 1.75 }}>
        <Typography noWrap sx={{ fontWeight: 800, fontSize: 14, color: "#0B2B26" }}>
          {place.title}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5, color: "#637381" }}>
          <PlaceOutlinedIcon sx={{ fontSize: 13 }} />
          <Typography noWrap sx={{ fontSize: 11 }}>
            {place.province}
          </Typography>
        </Stack>
        <Typography sx={{ mt: 0.75, fontSize: 11, lineHeight: 1.5, color: "#637381", height: 33, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {place.description}
        </Typography>
        {place.rating !== undefined && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1.25 }}>
            <StarIcon sx={{ fontSize: 14, color: "#FFB020" }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{place.rating.toFixed(1)}</Typography>
            <Typography sx={{ fontSize: 10, color: "#919EAB" }}>({place.reviews} đánh giá)</Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

interface Props {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  /** Thẻ địa điểm; hoặc truyền children để tự vẽ thẻ (vd thẻ tour). */
  places?: PlaceCard[];
  children?: ReactNode;
}

/** Một khu vực: tiêu đề, mô tả, "Xem tất cả" và hàng thẻ cuộn ngang bằng hai nút mũi tên. */
export default function PlaceSection({ id, icon, title, description, href, places = [], children }: Props) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth, behavior: "smooth" });

  return (
    <Box id={id} component="section" sx={{ px: { xs: 2, md: "4.8%" }, pt: 5, scrollMarginTop: 70 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ color: "#0B5E50", display: "grid", "& svg": { fontSize: 36 } }}>{icon}</Box>
            <Typography component="h2" sx={{ fontWeight: 800, fontSize: { xs: 22, md: 26 }, color: "#0B2B26" }}>
              {title}
            </Typography>
          </Stack>
          <Typography sx={{ mt: 1.25, maxWidth: 540, fontSize: 13, lineHeight: 1.6, color: "#637381" }}>{description}</Typography>
        </Box>
        <Stack alignItems="flex-end" spacing={1.5} sx={{ flexShrink: 0 }}>
          <Box component={NextLink} href={href} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: BRAND, fontWeight: 700, fontSize: 12, textDecoration: "none", mt: 1 }}>
            Xem tất cả <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton aria-label="Trước" onClick={() => scroll(-1)} sx={{ width: 30, height: 30, bgcolor: "#fff", boxShadow: "0 2px 8px rgba(16,40,60,0.15)" }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="Sau" onClick={() => scroll(1)} sx={{ width: 30, height: 30, bgcolor: "#fff", boxShadow: "0 2px 8px rgba(16,40,60,0.15)" }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>

      <Box
        ref={rail}
        sx={{ mt: 2.5, pb: 2.5, px: 0.5, mx: -0.5, display: "flex", gap: "20px", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
      >
        {children ?? places.map((p) => <Card key={p.key} place={p} />)}
      </Box>
    </Box>
  );
}
