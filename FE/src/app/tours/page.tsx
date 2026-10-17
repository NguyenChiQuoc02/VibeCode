"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, Chip, CircularProgress, FormControlLabel, InputBase, MenuItem, Select, Stack, Switch, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageHero from "@/components/site/PageHero";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { HERO_IMAGES, SITE } from "@/components/site/tokens";
import RecommendedTours from "@/components/tour/RecommendedTours";
import TourCard from "@/components/tour/TourCard";
import { useAuth } from "@/context/AuthContext";
import { tourApi } from "@/lib/api";
import { trackEvent } from "@/lib/track";
import { tourAvailability, todayIso } from "@/lib/tourFormat";

const PAGE = 12;
type Sort = "newest" | "soonest" | "priceAsc" | "priceDesc" | "rating";
const DURATIONS = [
  { label: "Tất cả", test: () => true },
  { label: "1–2 ngày", test: (d: number) => d <= 2 },
  { label: "3–4 ngày", test: (d: number) => d >= 3 && d <= 4 },
  { label: "5 ngày trở lên", test: (d: number) => d >= 5 },
];

/** Danh sách tour: bìa lớn, tìm kiếm trong ảnh bìa, bộ lọc và sắp xếp. */
export default function ToursPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [duration, setDuration] = useState(0);
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [sort, setSort] = useState<Sort>("soonest");
  // Có hàng trăm tour nên chỉ vẽ dần từng đợt.
  const [shown, setShown] = useState(PAGE);
  const { data = [], isPending, error } = useQuery({ queryKey: ["tours"], queryFn: () => tourApi.list() });

  const tours = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const today = todayIso();
    let list = data.filter((t) => t.status !== "CANCELLED" && t.endDate >= today);
    if (needle) list = list.filter((t) => t.name.toLowerCase().includes(needle));
    list = list.filter((t) => DURATIONS[duration].test(t.durationDays));
    if (onlyOpen) list = list.filter((t) => tourAvailability(t).open);
    const sorted = [...list];
    if (sort === "soonest") sorted.sort((a, b) => a.startDate.localeCompare(b.startDate));
    else if (sort === "priceAsc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "priceDesc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating") sorted.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    return sorted;
  }, [data, q, duration, onlyOpen, sort]);

  const reset = () => setShown(PAGE);

  // Ghi nhận từ khóa tìm kiếm sau khi người dùng ngừng gõ một lúc.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const t = setTimeout(() => trackEvent({ type: "SEARCH", query: term }), 1000);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <SiteShell>
      <PageHero image={HERO_IMAGES.halong} eyebrow="Hành trình của bạn" title="Tour du lịch trọn gói" subtitle="Những chuyến đi được thiết kế quanh các di tích và điểm đến nổi bật. Đăng ký nhanh, thanh toán tiền mặt sau khi kết thúc hành trình.">
        <Box sx={{ display: "flex", alignItems: "center", maxWidth: 560, height: 54, pl: 2.5, pr: 0.75, borderRadius: 7, bgcolor: "#fff", boxShadow: "0 14px 34px rgba(0,0,0,0.28)" }}>
          <SearchIcon sx={{ color: SITE.muted, mr: 1.25 }} />
          <InputBase
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              reset();
            }}
            placeholder="Tìm tour theo tên, điểm đến..."
            sx={{ flexGrow: 1, fontSize: 15, color: SITE.ink }}
            inputProps={{ "aria-label": "Tìm tour" }}
          />
          <Box sx={{ px: 2.5, height: 42, borderRadius: 6, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14, background: SITE.gradientCoral }}>{isPending ? "..." : `${tours.length} tour`}</Box>
        </Box>
      </PageHero>

      <SiteContainer sx={{ mt: -3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between" sx={{ mb: 4, p: 2, borderRadius: 4, bgcolor: "#fff", boxShadow: SITE.shadow }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {DURATIONS.map((d, i) => (
              <Chip
                key={d.label}
                label={d.label}
                onClick={() => {
                  setDuration(i);
                  reset();
                }}
                sx={{ fontWeight: 700, bgcolor: duration === i ? SITE.brand : "rgba(14,124,91,0.08)", color: duration === i ? "#fff" : SITE.brandDark, "&:hover": { bgcolor: duration === i ? SITE.brand : "rgba(14,124,91,0.16)" } }}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={onlyOpen}
                  onChange={(e) => {
                    setOnlyOpen(e.target.checked);
                    reset();
                  }}
                  color="success"
                />
              }
              label={<Typography sx={{ fontSize: 13, fontWeight: 600 }}>Còn chỗ</Typography>}
            />
            <Select size="small" value={sort} onChange={(e) => setSort(e.target.value as Sort)} sx={{ minWidth: 200, borderRadius: 5, fontSize: 13, fontWeight: 600 }}>
              <MenuItem value="soonest">Khởi hành sớm nhất</MenuItem>
              <MenuItem value="newest">Mới thêm gần đây</MenuItem>
              <MenuItem value="priceAsc">Giá thấp đến cao</MenuItem>
              <MenuItem value="priceDesc">Giá cao đến thấp</MenuItem>
              <MenuItem value="rating">Đánh giá cao nhất</MenuItem>
            </Select>
          </Stack>
        </Stack>

        {error && <Alert severity="error">{(error as Error).message}</Alert>}
        {isPending ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <CircularProgress sx={{ color: SITE.brand }} />
          </Box>
        ) : tours.length === 0 ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <Typography sx={{ fontFamily: SITE.serif, fontSize: 26, color: SITE.ink }}>Chưa có tour phù hợp</Typography>
            <Typography sx={{ color: SITE.muted, mt: 1 }}>Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác nhé.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 3.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } }}>
            {tours.slice(0, shown).map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </Box>
        )}
        {tours.length > shown && (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button onClick={() => setShown((n) => n + PAGE)} sx={{ px: 5, height: 48, borderRadius: 6, fontSize: 15, color: "#fff", background: SITE.gradientBrand, boxShadow: "0 10px 24px rgba(14,124,91,0.35)", "&:hover": { filter: "brightness(1.08)" } }}>
              Xem thêm {Math.min(PAGE, tours.length - shown)} tour
            </Button>
          </Box>
        )}
        {!isPending && (
          <Box sx={{ mt: 8, mb: 6 }}>
            {user ? (
              <RecommendedTours title="Dành cho bạn" subtitle="Gợi ý dựa trên các tour bạn đã đặt và quan tâm." source="for_me" limit={4} />
            ) : (
              <RecommendedTours title="Đang được quan tâm" subtitle="Những tour được nhiều khách đặt và đánh giá cao." source="popular" limit={4} />
            )}
          </Box>
        )}
      </SiteContainer>
    </SiteShell>
  );
}
