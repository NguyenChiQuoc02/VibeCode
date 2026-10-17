"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Autocomplete, Box, CircularProgress, FormControlLabel, MenuItem, Pagination, Stack, Switch, TextField, Typography } from "@mui/material";
import CarCard from "@/components/cars/CarCard";
import CarsShell from "@/components/cars/CarsShell";
import { AUTO } from "@/components/cars/theme";
import { carApi, carBrandApi } from "@/lib/api";

const PAGE_SIZE = 12;
const PRICE_RANGES = [
  { value: "", label: "Mọi mức giá" },
  { value: "0-1000", label: "Dưới 1 tỷ" },
  { value: "1000-2000", label: "1 - 2 tỷ" },
  { value: "2000-5000", label: "2 - 5 tỷ" },
  { value: "5000-", label: "Trên 5 tỷ" },
];

/** Danh sách xe có lọc; bộ lọc nằm trên URL để chia sẻ và quay lại được. */
export default function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const get = (k: string) => params.get(k) ?? "";
  const page = Math.max(parseInt(get("page") || "1", 10) || 1, 1);

  const [q, setQ] = useState(get("q"));
  useEffect(() => setQ(get("q")), [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
    if (!("page" in patch)) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  };
  // Gõ tìm kiếm: chờ 400ms rồi mới lọc.
  useEffect(() => {
    if (q === get("q")) return;
    const t = setTimeout(() => set({ q }), 400);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const [minK, maxK] = get("price").split("-");
  const filter = {
    q: get("q") || undefined,
    brand: get("brand") || undefined,
    bodyType: get("bodyType") || undefined,
    fuel: get("fuel") || undefined,
    minPrice: minK ? Number(minK) * 1_000_000 : undefined,
    maxPrice: maxK ? Number(maxK) * 1_000_000 : undefined,
    hasImage: get("hasImage") === "1" ? true : undefined,
    page: page - 1,
    size: PAGE_SIZE,
  };

  const list = useQuery({ queryKey: ["cars", "catalog", filter], queryFn: () => carApi.page(filter), placeholderData: keepPreviousData });
  const stats = useQuery({ queryKey: ["cars", "stats"], queryFn: () => carApi.stats(), staleTime: 60_000 });
  const brands = useQuery({ queryKey: ["car-brands", "all"], queryFn: () => carBrandApi.list(), staleTime: 300_000 });
  const total = list.data?.total ?? 0;

  return (
    <CarsShell>
      <Box sx={{ background: "linear-gradient(100deg, #0B0E14 0%, #1A1F2C 60%, #4A3436 100%)", color: "#fff", px: { xs: 2, md: "7%" }, py: 5 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: AUTO.red }}>XE MỚI</Typography>
        <Typography component="h1" sx={{ fontWeight: 800, fontSize: { xs: 28, md: 36 }, mt: 0.5 }}>Tìm chiếc xe của bạn</Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
          {stats.data ? `${stats.data.total.toLocaleString("vi-VN")} mẫu xe của ${stats.data.brands} hãng trên toàn thế giới` : "Mẫu xe của các hãng trên toàn thế giới"}
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2, md: "7%" }, py: 4 }}>
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1.4fr 1.2fr 1fr 1fr 1fr" }, alignItems: "center" }}>
          <TextField size="small" label="Tìm theo tên xe" value={q} onChange={(e) => setQ(e.target.value)} sx={{ bgcolor: "#fff" }} />
          <Autocomplete
            size="small"
            options={(brands.data ?? []).map((b) => b.name)}
            value={get("brand") || null}
            onChange={(_, v) => set({ brand: v ?? "" })}
            renderInput={(p) => <TextField {...p} label="Hãng xe" />}
            sx={{ bgcolor: "#fff" }}
            noOptionsText="Không có hãng phù hợp"
          />
          <TextField select size="small" label="Kiểu xe" value={get("bodyType")} onChange={(e) => set({ bodyType: e.target.value })} sx={{ bgcolor: "#fff" }}>
            <MenuItem value="">Tất cả</MenuItem>
            {(stats.data?.bodyTypes ?? []).map((b) => (
              <MenuItem key={b} value={b}>{b}</MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Nhiên liệu" value={get("fuel")} onChange={(e) => set({ fuel: e.target.value })} sx={{ bgcolor: "#fff" }}>
            <MenuItem value="">Tất cả</MenuItem>
            {(stats.data?.fuels ?? []).map((f) => (
              <MenuItem key={f} value={f}>{f}</MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Mức giá" value={get("price")} onChange={(e) => set({ price: e.target.value })} sx={{ bgcolor: "#fff" }}>
            {PRICE_RANGES.map((r) => (
              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5, mb: 2.5 }}>
          <Typography sx={{ fontSize: 13, color: AUTO.muted }}>{list.isPending ? "Đang tải..." : `${total.toLocaleString("vi-VN")} xe phù hợp`}</Typography>
          <FormControlLabel control={<Switch size="small" checked={get("hasImage") === "1"} onChange={(e) => set({ hasImage: e.target.checked ? "1" : "" })} />} label={<Typography sx={{ fontSize: 13 }}>Chỉ xe có ảnh</Typography>} />
        </Stack>

        {list.isPending ? (
          <Box sx={{ py: 8, textAlign: "center" }}><CircularProgress /></Box>
        ) : list.isError ? (
          <Typography color="error">{(list.error as Error).message}</Typography>
        ) : (list.data?.items.length ?? 0) === 0 ? (
          <Typography sx={{ py: 8, textAlign: "center", color: AUTO.muted }}>Không tìm thấy xe phù hợp với bộ lọc.</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, opacity: list.isPlaceholderData ? 0.6 : 1, transition: "opacity .15s" }}>
            {list.data!.items.map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </Box>
        )}
        {total > PAGE_SIZE && (
          <Stack alignItems="center" sx={{ mt: 4 }}>
            <Pagination count={Math.ceil(total / PAGE_SIZE)} page={page} onChange={(_, p) => { set({ page: p > 1 ? String(p) : "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }} shape="rounded" siblingCount={1} />
          </Stack>
        )}
      </Box>
    </CarsShell>
  );
}
