"use client";

import NextLink from "next/link";
import { Box, Typography } from "@mui/material";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import FavoriteButton from "@/components/site/FavoriteButton";
import { SITE } from "@/components/site/tokens";

interface Props {
  kind: "LANDMARK" | "DESTINATION";
  id: string;
  title: string;
  image?: string;
  badge?: string;
  badgeColor?: string;
  location?: string;
  description?: string;
}

/** Thẻ địa điểm dạng ảnh dọc: tên và địa chỉ đè lên ảnh, mô tả hiện ra khi rê chuột. */
export default function PlaceTile({ kind, id, title, image, badge, badgeColor, location, description }: Props) {
  const href = `/explore/${kind === "LANDMARK" ? "landmarks" : "destinations"}/${id}`;
  return (
    <Box
      component={NextLink}
      href={href}
      sx={{
        position: "relative",
        display: "block",
        height: 340,
        borderRadius: `${SITE.radius}px`,
        overflow: "hidden",
        textDecoration: "none",
        background: SITE.gradientSky,
        boxShadow: SITE.shadow,
        transition: "transform .25s, box-shadow .25s",
        "&:hover": { transform: "translateY(-6px)", boxShadow: SITE.shadowHover },
        "&:hover img": { transform: "scale(1.08)" },
        "&:hover .desc": { opacity: 1, maxHeight: 80 },
      }}
    >
      {image && <Box component="img" src={image} alt={title} loading="lazy" referrerPolicy="no-referrer" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s ease" }} />}
      <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.82) 100%)" }} />
      {badge && <Box sx={{ position: "absolute", top: 14, left: 14, px: 1.5, py: 0.5, borderRadius: 5, fontSize: 11, fontWeight: 700, color: "#fff", bgcolor: badgeColor ?? "rgba(14,124,91,0.92)", backdropFilter: "blur(6px)", maxWidth: "70%" }}>{badge}</Box>}
      <Box sx={{ position: "absolute", top: 12, right: 12 }}>
        <FavoriteButton type={kind} id={id} />
      </Box>
      <Box sx={{ position: "absolute", left: 16, right: 16, bottom: 16, color: "#fff" }}>
        <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 20, lineHeight: 1.25, textShadow: "0 2px 10px rgba(0,0,0,0.55)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</Typography>
        {location && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, opacity: 0.92 }}>
            <PlaceIcon sx={{ fontSize: 15 }} />
            <Typography noWrap sx={{ fontSize: 12.5 }}>{location}</Typography>
          </Box>
        )}
        {description && (
          <Typography className="desc" sx={{ mt: 0.75, fontSize: 12.5, lineHeight: 1.5, opacity: 0, maxHeight: 0, overflow: "hidden", transition: "opacity .3s, max-height .3s", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{description}</Typography>
        )}
      </Box>
    </Box>
  );
}
