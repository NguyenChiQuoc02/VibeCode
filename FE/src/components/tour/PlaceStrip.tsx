"use client";

import NextLink from "next/link";
import { Box, Typography } from "@mui/material";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import { SITE } from "@/components/site/tokens";
import { PlaceRef } from "@/lib/api";

/** Hàng thẻ địa điểm cuộn ngang; mỗi thẻ mở trang chi tiết của di tích hoặc địa điểm du lịch. */
export default function PlaceStrip({ title, kind, places }: { title: string; kind: "landmarks" | "destinations"; places: PlaceRef[] }) {
  if (places.length === 0) return null;
  return (
    <Box>
      <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 24, color: SITE.ink, mb: 2 }}>{title}</Typography>
      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1.5, mx: -0.5, px: 0.5, scrollSnapType: "x proximity", "&::-webkit-scrollbar": { height: 6 } }}>
        {places.map((p) => (
          <Box
            key={p.id}
            component={NextLink}
            href={`/explore/${kind}/${p.id}`}
            sx={{
              flex: "0 0 220px",
              scrollSnapAlign: "start",
              position: "relative",
              height: 260,
              borderRadius: 4,
              overflow: "hidden",
              textDecoration: "none",
              background: SITE.gradientSky,
              boxShadow: SITE.shadow,
              transition: "transform .25s, box-shadow .25s",
              "&:hover": { transform: "translateY(-5px)", boxShadow: SITE.shadowHover },
              "&:hover img": { transform: "scale(1.08)" },
            }}
          >
            {p.image && <Box component="img" src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .6s ease" }} />}
            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.78) 100%)" }} />
            <Box sx={{ position: "absolute", left: 14, right: 14, bottom: 14, color: "#fff" }}>
              <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 17, lineHeight: 1.25, textShadow: "0 2px 8px rgba(0,0,0,0.5)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</Typography>
              {p.address && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, opacity: 0.9 }}>
                  <PlaceIcon sx={{ fontSize: 14 }} />
                  <Typography noWrap sx={{ fontSize: 12 }}>{p.address}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
