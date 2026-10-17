"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, IconButton, InputBase, Typography } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { BRAND } from "@/components/landing/LandingHeader";

// Ảnh Vịnh Hạ Long (Wikimedia Commons), bản 1920px.
const HERO_IMAGE = "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/V%E1%BB%8Bnh_H%E1%BA%A1_Long_-_NKS.jpg/1920px-V%E1%BB%8Bnh_H%E1%BA%A1_Long_-_NKS.jpg";

export const SCRIPT_FONT = '"Segoe Script", "Lucida Handwriting", "Brush Script MT", cursive';

export default function LandingHero() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = q.trim();
    router.push(text ? `/explore?tab=landmarks&q=${encodeURIComponent(text)}` : "/explore");
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: 460, md: 520 },
        pt: { xs: 12, md: 14 },
        pb: 14,
        px: { xs: 2, md: "4.8%" },
        color: "#fff",
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0) 100%), url("${HERO_IMAGE}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Typography sx={{ fontFamily: SCRIPT_FONT, fontStyle: "italic", fontSize: { xs: 40, md: 56 }, lineHeight: 1.1, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>Việt Nam</Typography>
      <Typography component="h1" sx={{ fontWeight: 800, fontSize: { xs: 34, md: 52 }, lineHeight: 1.1, maxWidth: 520, textShadow: "0 2px 10px rgba(0,0,0,0.35)" }}>
        Đi để cảm nhận
        <br />
        vẻ đẹp bất tận
      </Typography>
      <Typography sx={{ mt: 2.5, maxWidth: 470, fontSize: 14, lineHeight: 1.6, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
        Khám phá những di tích lịch sử, danh lam thắng cảnh và địa điểm du lịch hấp dẫn nhất trên khắp Việt Nam. Mỗi hành trình là một câu chuyện, mỗi điểm đến là một trải nghiệm.
      </Typography>

      <Box
        component="form"
        onSubmit={submit}
        sx={{ mt: 3, display: "flex", alignItems: "center", maxWidth: 410, height: 46, pl: 2, pr: 0.5, borderRadius: 6, bgcolor: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}
      >
        <PlaceOutlinedIcon sx={{ color: "#637381", fontSize: 20, mr: 1 }} />
        <InputBase value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bạn muốn đi đâu?" sx={{ flexGrow: 1, fontSize: 13 }} inputProps={{ "aria-label": "Tìm địa điểm" }} />
        <IconButton type="submit" aria-label="Tìm kiếm" sx={{ bgcolor: BRAND, color: "#fff", width: 38, height: 38, "&:hover": { bgcolor: "#0B6A4E" } }}>
          <SearchIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Chữ viết tay bên phải kèm mũi tên cong */}
      <Box sx={{ display: { xs: "none", md: "block" }, position: "absolute", right: "7%", bottom: 96, transform: "rotate(-12deg)", textAlign: "left" }}>
        <Typography sx={{ fontFamily: SCRIPT_FONT, fontStyle: "italic", fontSize: 22, lineHeight: 1.25, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
          Vẻ đẹp
          <br />
          Việt Nam
          <br />
          dang chờ bạn!
        </Typography>
        <svg width="70" height="40" viewBox="0 0 70 40" fill="none" style={{ marginLeft: 40 }} aria-hidden>
          <path d="M60 4 C 55 28, 30 36, 8 28" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 20 L6 28 L16 33" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Box>

      {/* Viền sóng cong ở đáy ảnh */}
      <Box component="svg" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden sx={{ position: "absolute", left: 0, bottom: -1, width: "100%", height: { xs: 36, md: 70 } }}>
        <path d="M0 80 L0 48 C 240 14 480 0 720 16 C 1000 36 1240 52 1440 22 L1440 80 Z" fill="#fff" />
      </Box>
    </Box>
  );
}
