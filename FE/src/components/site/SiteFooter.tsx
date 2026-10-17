"use client";

import NextLink from "next/link";
import { Box, Stack, Typography } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import Logo from "@/components/landing/Logo";
import { SITE } from "@/components/site/tokens";

const COLS = [
  { title: "Khám phá", links: [["Di tích, thắng cảnh", "/explore?tab=landmarks"], ["Địa điểm du lịch", "/explore?tab=destinations"], ["Bản đồ du lịch", "/map"], ["Blog du lịch", "/blog"], ["Về chúng tôi", "/about"], ["Game dò mìn", "/game"]] },
  { title: "Hành trình", links: [["Tất cả tour", "/tours"], ["Tour của tôi", "/my-tours"], ["Yêu thích", "/favorites"]] },
  { title: "Tài khoản", links: [["Hồ sơ cá nhân", "/profile"], ["Đăng nhập", "/login"], ["Đăng ký", "/register"]] },
];

export default function SiteFooter() {
  return (
    <Box component="footer" sx={{ mt: 10, color: "#D7EBE5", background: `linear-gradient(180deg, ${SITE.brandDark} 0%, #072A25 100%)` }}>
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, py: 6, display: "grid", gap: 5, gridTemplateColumns: { xs: "1fr", md: "1.4fr repeat(3, 1fr)" } }}>
        <Box>
          <Box sx={{ "& p": { color: "#fff !important" } }}>
            <Logo />
          </Box>
          <Typography sx={{ mt: 2, fontSize: 13, lineHeight: 1.8, maxWidth: 320, color: "#A9CBC2" }}>
            Khám phá di tích, danh lam thắng cảnh và những điểm đến đẹp nhất Việt Nam. Đặt tour dễ dàng, thanh toán tiền mặt sau chuyến đi.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
            {[FacebookIcon, InstagramIcon, YouTubeIcon].map((Icon, i) => (
              <Box key={i} sx={{ width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,0.1)", transition: "background .2s", "&:hover": { bgcolor: SITE.coral } }}>
                <Icon sx={{ fontSize: 19, color: "#fff" }} />
              </Box>
            ))}
          </Stack>
        </Box>
        {COLS.map((c) => (
          <Box key={c.title}>
            <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 17, color: "#fff", mb: 1.5 }}>{c.title}</Typography>
            <Stack spacing={1}>
              {c.links.map(([label, href]) => (
                <Box key={href} component={NextLink} href={href} sx={{ fontSize: 13, color: "#A9CBC2", textDecoration: "none", "&:hover": { color: "#fff" } }}>
                  {label}
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", py: 2.5, textAlign: "center", fontSize: 12, color: "#7FA89E" }}>© {new Date().getFullYear()} VietJourney. Ảnh minh họa từ Wikimedia Commons.</Box>
    </Box>
  );
}
