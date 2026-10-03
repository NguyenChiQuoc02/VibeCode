"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { NAV } from "@/lib/navigation";

interface Props {
  /** Ghi đè tiêu đề lấy từ menu (vd lời chào ở trang tổng quan, "Thêm mới ..."). */
  title?: string;
  subtitle?: string;
  /** Nút hành động bên phải. */
  action?: ReactNode;
  /** Dùng icon của menu có href này thay vì lấy theo đường dẫn hiện tại. */
  navHref?: string;
}

/** Tiêu đề trang kèm icon của menu tương ứng. */
export default function PageTitle({ title, subtitle, action, navHref }: Props) {
  const pathname = usePathname();
  const href = navHref ?? pathname;
  // Khớp chính xác, hoặc menu dài nhất là tiền tố của đường dẫn (trang con như /landmarks/new).
  const nav = NAV.filter((n) => href === n.href || (n.href !== "/dashboard" && href.startsWith(`${n.href}/`))).sort((a, b) => b.href.length - a.href.length)[0];
  const exact = nav && href === nav.href;

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
        {nav && (
          <Box
            sx={{
              width: 46,
              height: 46,
              flexShrink: 0,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              bgcolor: "rgba(0, 167, 111, 0.12)",
              "& svg": { fontSize: 26 },
            }}
          >
            {nav.icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5">{title ?? nav?.title}</Typography>
          {(subtitle ?? (exact ? nav?.subtitle : undefined)) && (
            <Typography variant="body2" color="text.secondary">
              {subtitle ?? nav?.subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {action}
    </Stack>
  );
}
