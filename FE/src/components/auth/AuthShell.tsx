"use client";

import { ReactNode } from "react";
import NextLink from "next/link";
import { Box, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExploreIcon from "@mui/icons-material/ExploreOutlined";
import LuggageIcon from "@mui/icons-material/LuggageOutlined";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCarFilledOutlined";
import Logo from "@/components/landing/Logo";
import { HERO_IMAGES, SITE } from "@/components/site/tokens";

const PERKS = [
  { icon: <ExploreIcon />, title: "Hơn 5.000 điểm đến", text: "Di tích, thắng cảnh trên khắp Việt Nam" },
  { icon: <LuggageIcon />, title: "Đặt tour dễ dàng", text: "Thanh toán tiền mặt sau chuyến đi" },
  { icon: <DirectionsCarIcon />, title: "Lái thử xe miễn phí", text: "Hơn 4.600 mẫu xe của 600+ hãng" },
  { icon: <FavoriteIcon />, title: "Lưu mục yêu thích", text: "Gom mọi nơi bạn muốn đến vào một chỗ" },
];

/** Khung chung cho đăng nhập và đăng ký: ảnh phong cảnh bên trái, biểu mẫu bên phải. */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" }, bgcolor: "#fff" }}>
      <Box sx={{ position: "relative", display: { xs: "none", md: "flex" }, flexDirection: "column", justifyContent: "space-between", p: 6, color: "#fff", overflow: "hidden", backgroundColor: SITE.brandDark }}>
        <Box component="img" src={HERO_IMAGES.halong} alt="" referrerPolicy="no-referrer" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", animation: "kenburns 24s ease-in-out infinite alternate", "@keyframes kenburns": { from: { transform: "scale(1)" }, to: { transform: "scale(1.12)" } } }} />
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(7,42,37,0.82) 0%, rgba(14,124,91,0.35) 55%, rgba(7,42,37,0.9) 100%)" }} />
        <Box sx={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", right: -120, top: -100, background: "radial-gradient(circle, rgba(255,107,74,0.45), transparent 70%)" }} />

        <Box sx={{ position: "relative", "& p": { color: "#fff !important" } }}>
          <NextLink href="/" style={{ textDecoration: "none" }}>
            <Logo />
          </NextLink>
        </Box>

        <Box sx={{ position: "relative" }}>
          <Typography component="h2" sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 40, lineHeight: 1.2, maxWidth: 460 }}>
            Mỗi hành trình đẹp bắt đầu bằng một{" "}
            <Box component="span" sx={{ color: "#FFB020", fontStyle: "italic" }}>
              cú chạm
            </Box>
          </Typography>
          <Box sx={{ mt: 4, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, maxWidth: 560 }}>
            {PERKS.map((p) => (
              <Stack key={p.title} direction="row" spacing={1.5} sx={{ p: 1.75, borderRadius: 3, bgcolor: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.22)" }}>
                <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: 2, display: "grid", placeItems: "center", background: SITE.gradientCoral, boxShadow: "0 6px 14px rgba(255,107,74,0.4)" }}>{p.icon}</Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{p.title}</Typography>
                  <Typography sx={{ fontSize: 11.5, opacity: 0.85, lineHeight: 1.45 }}>{p.text}</Typography>
                </Box>
              </Stack>
            ))}
          </Box>
        </Box>

        <Typography sx={{ position: "relative", fontSize: 12, opacity: 0.75 }}>Ảnh: Vịnh Hạ Long, Wikimedia Commons</Typography>
      </Box>

      <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2.5, sm: 6 }, py: 6, background: `radial-gradient(700px 400px at 100% 0%, rgba(20,184,166,0.12), transparent 60%), radial-gradient(600px 400px at 0% 100%, rgba(255,107,74,0.1), transparent 60%), ${SITE.mist}` }}>
        <Box component={NextLink} href="/" sx={{ position: "absolute", top: 24, left: { xs: 20, sm: 40 }, display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: 13, fontWeight: 600, color: SITE.muted, textDecoration: "none", "&:hover": { color: SITE.brand } }}>
          <ArrowBackIcon sx={{ fontSize: 16 }} /> Về trang chủ
        </Box>
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
            <Logo />
          </Box>
          <Typography component="h1" sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 34, color: SITE.ink }}>
            {title}
          </Typography>
          <Typography sx={{ mt: 0.75, mb: 3.5, color: SITE.muted, fontSize: 14.5 }}>{subtitle}</Typography>
          <Box sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, bgcolor: "#fff", boxShadow: SITE.shadow, border: `1px solid ${SITE.line}` }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
