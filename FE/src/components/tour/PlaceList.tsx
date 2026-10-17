"use client";

import { Box, Stack, Typography } from "@mui/material";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import { PlaceRef } from "@/lib/api";

/** Các địa điểm được liên kết với tour (di tích hoặc địa điểm du lịch). Không hiện gì nếu danh sách rỗng. */
export default function PlaceList({ title, places }: { title: string; places: PlaceRef[] }) {
  if (places.length === 0) return null;
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
        {places.map((p) => (
          <Stack key={p.id} direction="row" spacing={1.5} sx={{ bgcolor: "#fff", borderRadius: 2, p: 1, boxShadow: "0 2px 10px rgba(16,40,60,0.08)" }}>
            <Box sx={{ width: 76, height: 64, flexShrink: 0, borderRadius: 1.5, overflow: "hidden", background: "linear-gradient(135deg,#BFE8D8,#8FC7E8)" }}>
              {p.image && <Box component="img" src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
            </Box>
            <Box sx={{ minWidth: 0, alignSelf: "center" }}>
              <Typography noWrap sx={{ fontWeight: 700, fontSize: 14 }}>
                {p.name}
              </Typography>
              {p.address && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "#637381" }}>
                  <PlaceIcon sx={{ fontSize: 13 }} />
                  <Typography noWrap sx={{ fontSize: 12 }}>
                    {p.address}
                  </Typography>
                </Stack>
              )}
            </Box>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}
