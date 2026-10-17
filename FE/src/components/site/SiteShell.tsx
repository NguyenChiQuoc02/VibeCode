"use client";

import { ReactNode } from "react";
import { Box } from "@mui/material";
import LandingHeader from "@/components/landing/LandingHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { SITE } from "@/components/site/tokens";

/** Khung chung cho mọi trang của người dùng: header, nền mờ sương và footer. Khác khu quản trị (sidebar). */
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: SITE.mist,
        backgroundImage: "radial-gradient(900px 500px at 8% -5%, rgba(20,184,166,0.13), transparent 60%), radial-gradient(800px 480px at 100% 12%, rgba(255,107,74,0.09), transparent 60%)",
        backgroundRepeat: "no-repeat",
      }}
    >
      <LandingHeader />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <SiteFooter />
    </Box>
  );
}

/** Căn nội dung giữa trang với lề hai bên đồng nhất. */
export function SiteContainer({ children, sx }: { children: ReactNode; sx?: object }) {
  return <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, position: "relative", zIndex: 1, ...sx }}>{children}</Box>;
}
