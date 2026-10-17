"use client";

import { Box, Chip, Rating, Stack, Typography } from "@mui/material";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Tour, tourApi } from "@/lib/api";
import { TOUR_STATUS, formatDate, formatVnd } from "@/lib/tourFormat";

const FIELDS: FieldDef<Tour>[] = [
  {
    key: "name",
    label: "Tên tour",
    kind: "text",
    table: (t) => (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 52, height: 40, flexShrink: 0, borderRadius: 1, overflow: "hidden", background: "linear-gradient(135deg,#BFE8D8,#8FC7E8)" }}>
          {t.image && <Box component="img" src={t.image} alt={t.name} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{t.name}</Typography>
      </Stack>
    ),
  },
  { key: "startDate", label: "Thời gian", kind: "text", table: (t) => `${formatDate(t.startDate)} - ${formatDate(t.endDate)}` },
  { key: "price", label: "Giá / người", kind: "number", table: (t) => formatVnd(t.price) },
  { key: "bookedSeats", label: "Đã đăng ký", kind: "number", table: (t) => `${t.bookedSeats} / ${t.maxParticipants}` },
  {
    key: "avgRating",
    label: "Đánh giá",
    kind: "number",
    table: (t) => (t.reviewCount > 0 ? <Rating value={t.avgRating} precision={0.5} readOnly size="small" /> : "–"),
  },
  { key: "status", label: "Trạng thái", kind: "text", table: (t) => <Chip size="small" color={TOUR_STATUS[t.status].color} label={TOUR_STATUS[t.status].label} /> },
];

export default function ToursAdminPage() {
  return <CrudPage<Tour> title="Tour" noun="tour" basePath="/dashboard/tours" queryKey="tours" api={tourApi} fields={FIELDS} />;
}
