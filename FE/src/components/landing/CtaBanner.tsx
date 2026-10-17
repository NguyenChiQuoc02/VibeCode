"use client";

import NextLink from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { BRAND } from "@/components/landing/LandingHeader";
import { SCRIPT_FONT } from "@/components/landing/LandingHero";

const FEATURES = [
  { icon: <VerifiedUserOutlinedIcon />, title: "An toàn", text: "Thông tin đáng tin cậy" },
  { icon: <BoltIcon />, title: "Tiện lợi", text: "Đặt vé nhanh chóng" },
  { icon: <SupportAgentIcon />, title: "Hỗ trợ 24/7", text: "Luôn đồng hành cùng bạn" },
];

/** Dải kêu gọi cuối trang: ảnh nền, lời mời và ba cam kết. */
export default function CtaBanner({ image }: { image?: string }) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        mt: 3,
        minHeight: 300,
        px: { xs: 2, md: "4.8%" },
        pt: 5,
        pb: 12,
        backgroundImage: `linear-gradient(90deg, rgba(255,247,235,0.92) 0%, rgba(255,247,235,0.55) 45%, rgba(255,247,235,0) 75%)${image ? `, url("${image}")` : ""}`,
        backgroundColor: "#F6E7CF",
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
      }}
    >
      <Typography sx={{ fontFamily: SCRIPT_FONT, fontStyle: "italic", fontWeight: 700, fontSize: { xs: 22, md: 28 }, lineHeight: 1.25, color: "#10372F", maxWidth: 420 }}>
        Hành trình của bạn bắt đầu từ đây!
      </Typography>
      <Typography sx={{ mt: 1.5, maxWidth: 400, fontSize: 12, lineHeight: 1.6, color: "#2E4A43" }}>
        Khám phá Việt Nam - Đặt ngay hôm nay để nhận những ưu đãi hấp dẫn và trải nghiệm tuyệt vời nhất!
      </Typography>
      <Button component={NextLink} href="/tours" variant="contained" endIcon={<ArrowForwardIcon />} sx={{ mt: 2.5, bgcolor: BRAND, borderRadius: 5, px: 3, boxShadow: "none", "&:hover": { bgcolor: "#0B6A4E" } }}>
        Khám phá ngay
      </Button>

      <Box sx={{ display: { xs: "none", md: "block" }, position: "absolute", right: "7%", top: 56, transform: "rotate(-8deg)", color: "#fff" }}>
        <Typography sx={{ fontFamily: SCRIPT_FONT, fontStyle: "italic", fontSize: 20, lineHeight: 1.3, textShadow: "0 2px 8px rgba(0,0,0,0.45)" }}>
          Việt Nam
          <br />
          có vô vàn điều
          <br />
          đẹp để khám phá!
        </Typography>
        <FavoriteBorderIcon sx={{ fontSize: 22, mt: 0.5, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }} />
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 4 }}
        sx={{ position: "absolute", left: "50%", bottom: 20, transform: "translateX(-50%)", px: 3, py: 1.5, borderRadius: 3, bgcolor: "#fff", boxShadow: "0 8px 24px rgba(16,40,60,0.18)", width: { xs: "calc(100% - 32px)", sm: "auto" } }}
      >
        {FEATURES.map((f) => (
          <Stack key={f.title} direction="row" spacing={1.25} alignItems="center">
            <Box sx={{ color: "#0B5E50", display: "grid", "& svg": { fontSize: 24 } }}>{f.icon}</Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 12, lineHeight: 1.2 }}>{f.title}</Typography>
              <Typography sx={{ fontSize: 9, color: "#637381" }}>{f.text}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
