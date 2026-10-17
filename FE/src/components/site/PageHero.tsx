"use client";

import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { SITE } from "@/components/site/tokens";
import { SCRIPT_FONT } from "@/components/landing/LandingHero";

interface Props {
  image?: string;
  /** Dòng chữ viết tay phía trên tiêu đề. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  height?: number;
  /** Khu vực dưới tiêu đề: ô tìm kiếm, thống kê... */
  children?: ReactNode;
}

/** Ảnh bìa đầu trang với lớp phủ tối dần, chữ lớn có chân và đáy cong. */
export default function PageHero({ image, eyebrow, title, subtitle, height = 360, children }: Props) {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: height,
        pt: { xs: 13, md: 15 },
        pb: { xs: 9, md: 11 },
        px: { xs: 2, md: 4 },
        color: "#fff",
        backgroundColor: SITE.brandDark,
        backgroundImage: `linear-gradient(180deg, rgba(4,28,25,0.55) 0%, rgba(4,28,25,0.35) 45%, rgba(4,28,25,0.7) 100%)${image ? `, url("${image}")` : `, ${SITE.gradientBrand}`}`,
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: "auto" }}>
        {eyebrow && <Typography sx={{ fontFamily: SCRIPT_FONT, fontStyle: "italic", fontSize: { xs: 22, md: 28 }, color: "#FFD9B0", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>{eyebrow}</Typography>}
        <Typography component="h1" sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: { xs: 34, md: 52 }, lineHeight: 1.1, textShadow: "0 3px 16px rgba(0,0,0,0.45)", maxWidth: 760 }}>
          {title}
        </Typography>
        {subtitle && <Typography sx={{ mt: 1.5, maxWidth: 620, fontSize: { xs: 14, md: 16 }, lineHeight: 1.6, color: "rgba(255,255,255,0.92)", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>{subtitle}</Typography>}
        {children && <Box sx={{ mt: 3 }}>{children}</Box>}
      </Box>
      <Box component="svg" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden sx={{ position: "absolute", left: 0, bottom: -1, width: "100%", height: { xs: 34, md: 64 } }}>
        <path d="M0 80 L0 44 C 260 6 520 0 760 20 C 1020 42 1240 52 1440 18 L1440 80 Z" fill={SITE.mist} />
      </Box>
    </Box>
  );
}
