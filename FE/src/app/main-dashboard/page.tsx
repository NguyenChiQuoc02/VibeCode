"use client";

import { ReactNode, useEffect } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import MapIcon from "@mui/icons-material/Map";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "@/context/AuthContext";

interface Group {
  label: string;
  href: string;
  icon: ReactNode;
  /** Màu nền thẻ và ô icon nhỏ. */
  bg: string;
  /** Vị trí góc trên trái của thẻ, tính từ tâm sân khấu. */
  card: [number, number];
  /** Vị trí góc trên trái của ô icon nhỏ, tính từ tâm sân khấu. */
  tile: [number, number];
}

// Bố cục theo mockup: 6 nhóm xung quanh vòng tròn trung tâm. Đổi href để trỏ tới trang tương ứng.
const GROUPS: Group[] = [
  { label: "Bảng điều khiển", href: "/dashboard", icon: <SpeedIcon />, bg: "#9FF0D5", card: [-120, -246], tile: [-24, -129] },
  { label: "Lớp bản đồ", href: "/dashboard/map", icon: <MapIcon />, bg: "#78C6FF", card: [-449, -186], tile: [-206, -76] },
  { label: "Kinh tế", href: "/dashboard/analytics", icon: <PaidIcon />, bg: "#FFE096", card: [208, -186], tile: [157, -76] },
  { label: "Văn hóa tín ngưỡng cộng đồng", href: "/dashboard/landmarks", icon: <AccountBalanceIcon />, bg: "#FFC5B0", card: [-449, 79], tile: [-206, 28] },
  { label: "Dân cư", href: "/dashboard/users", icon: <GroupsIcon />, bg: "#C2E4FF", card: [208, 79], tile: [157, 28] },
  { label: "Y tế - Giáo dục", href: "/dashboard/destinations", icon: <LocalHospitalIcon />, bg: "#85B1E6", card: [-120, 139], tile: [-24, 81] },
];

const INK = "#17517F";
const STAGE = { width: 900, height: 600 };
const CARD = { width: 240, height: 107 };
const TILE = 48;

export default function MainDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "ADMIN") router.replace("/");
  }, [loading, user, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff", overflow: "auto", display: "grid", placeItems: "center", p: 2 }}>
      <Button component={NextLink} href="/dashboard" startIcon={<ArrowBackIcon />} sx={{ position: "fixed", top: 16, left: 16, color: INK }}>
        Quản trị
      </Button>

      <Box sx={{ position: "relative", width: STAGE.width, height: STAGE.height, flexShrink: 0 }}>
        {GROUPS.map((g) => (
          <Box key={g.label}>
            {/* Ô icon nhỏ nằm giữa thẻ và vòng tròn trung tâm */}
            <Box
              sx={{
                position: "absolute",
                left: STAGE.width / 2 + g.tile[0],
                top: STAGE.height / 2 + g.tile[1],
                width: TILE,
                height: TILE,
                borderRadius: 2,
                bgcolor: g.bg,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 4px 10px rgba(23,81,127,0.12)",
                "& svg": { fontSize: 28 },
              }}
            >
              {g.icon}
            </Box>

            <Box
              component={NextLink}
              href={g.href}
              sx={{
                position: "absolute",
                left: STAGE.width / 2 + g.card[0],
                top: STAGE.height / 2 + g.card[1],
                width: CARD.width,
                height: CARD.height,
                borderRadius: 1.5,
                bgcolor: g.bg,
                color: INK,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                px: 1.5,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(23,81,127,0.12)",
                transition: "transform .15s, box-shadow .15s",
                "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 20px rgba(23,81,127,0.2)" },
              }}
            >
              {/* Icon lớn mờ làm họa tiết nền ở góc phải */}
              <Box sx={{ position: "absolute", right: -14, bottom: -18, opacity: 0.18, color: INK, "& svg": { fontSize: 110 } }}>{g.icon}</Box>
              <Box sx={{ width: 41, height: 41, borderRadius: "50%", bgcolor: "#fff", display: "grid", placeItems: "center", color: INK, position: "relative", "& svg": { fontSize: 22 } }}>
                {g.icon}
              </Box>
              <Typography variant="subtitle2" align="center" sx={{ fontWeight: 700, lineHeight: 1.25, position: "relative" }}>
                {g.label}
              </Typography>
            </Box>
          </Box>
        ))}

        {/* Vòng tròn trung tâm */}
        <Box
          sx={{
            position: "absolute",
            left: STAGE.width / 2 - 52,
            top: STAGE.height / 2 - 52,
            width: 105,
            height: 105,
            borderRadius: "50%",
            bgcolor: "#115A96",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(17,90,150,0.35)",
          }}
        >
          <SpeedIcon sx={{ fontSize: 20 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, mt: 0.25 }}>
            Dashboard
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
