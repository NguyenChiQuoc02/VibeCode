"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Alert, Autocomplete, Box, Button, Chip, CircularProgress, FormControlLabel, InputBase, Stack, Switch, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PageHero from "@/components/site/PageHero";
import PlaceTile from "@/components/site/PlaceTile";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { HERO_IMAGES, SITE } from "@/components/site/tokens";
import { Destination, Landmark, destinationApi, landmarkApi } from "@/lib/api";
import { DESTINATION_TYPES } from "@/lib/crudConfigs";
import { MountainMark } from "@/components/landing/Logo";
import { useProvinces } from "@/lib/useProvinces";

const SIZE = 12;
const LANDMARK_CATEGORIES = ["Di sản thế giới", "Di tích lịch sử", "Danh lam thắng cảnh", "Di tích quốc gia đặc biệt", "Di tích văn hóa, kiến trúc"];

/** Khám phá di tích và địa điểm du lịch: công khai, chỉ xem. useSearchParams cần Suspense. */
export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}

function ExploreContent() {
  const params = useSearchParams();
  const router = useRouter();
  const tab: "landmarks" | "destinations" = params.get("tab") === "destinations" ? "destinations" : "landmarks";
  const [input, setInput] = useState(params.get("q") ?? "");
  const [q, setQ] = useState(input);
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [onlyImage, setOnlyImage] = useState(true);
  const { provinces } = useProvinces();

  // Chờ người dùng ngừng gõ 350ms mới tìm.
  useEffect(() => {
    const t = setTimeout(() => setQ(input.trim()), 350);
    return () => clearTimeout(t);
  }, [input]);

  const switchTab = (next: typeof tab) => {
    setCategory("");
    router.replace(`/explore?tab=${next}`);
  };

  const landmarks = useInfiniteQuery({
    queryKey: ["explore", "landmarks", q, provinceCode, category, onlyImage],
    initialPageParam: 0,
    enabled: tab === "landmarks",
    queryFn: ({ pageParam }) => landmarkApi.list({ q: q || undefined, provinceCode: provinceCode ?? undefined, category: category || undefined, status: "ACTIVE", hasImage: onlyImage || undefined, page: pageParam, size: SIZE }),
    getNextPageParam: (last) => ((last.page + 1) * last.size < last.total ? last.page + 1 : undefined),
  });
  const destinations = useInfiniteQuery({
    queryKey: ["explore", "destinations", q, provinceCode, category, onlyImage],
    initialPageParam: 0,
    enabled: tab === "destinations",
    queryFn: ({ pageParam }) => destinationApi.list({ q: q || undefined, provinceCode: provinceCode ?? undefined, type: category || undefined, hasImage: onlyImage || undefined, offset: pageParam * SIZE, limit: SIZE }),
    getNextPageParam: (last, all) => (last.length === SIZE ? all.length : undefined),
  });

  const active = tab === "landmarks" ? landmarks : destinations;
  const provinceName = (code: number) => (provinces.find((p) => p.code === code)?.name ?? "").replace(/^(Tỉnh|Thành phố)\s+/, "");
  const lmItems: Landmark[] = landmarks.data?.pages.flatMap((p) => p.items) ?? [];
  const dsItems: Destination[] = destinations.data?.pages.flatMap((p) => p) ?? [];
  const total = tab === "landmarks" ? landmarks.data?.pages[0]?.total : undefined;
  const empty = !active.isPending && (tab === "landmarks" ? lmItems.length === 0 : dsItems.length === 0);
  const categories = tab === "landmarks" ? LANDMARK_CATEGORIES : DESTINATION_TYPES.map((t) => t.value as string);

  return (
    <SiteShell>
      <PageHero image={tab === "landmarks" ? HERO_IMAGES.fansipan : HERO_IMAGES.dalat} eyebrow="Việt Nam muôn màu" title="Khám phá điểm đến" subtitle="Hàng nghìn di tích, danh lam thắng cảnh và địa điểm du lịch trải dài khắp đất nước." height={380}>
        <Box sx={{ display: "flex", alignItems: "center", maxWidth: 600, height: 54, pl: 2.5, pr: 0.75, borderRadius: 7, bgcolor: "#fff", boxShadow: "0 14px 34px rgba(0,0,0,0.28)" }}>
          <SearchIcon sx={{ color: SITE.muted, mr: 1.25 }} />
          <InputBase value={input} onChange={(e) => setInput(e.target.value)} placeholder={tab === "landmarks" ? "Tìm di tích, danh lam thắng cảnh..." : "Tìm địa điểm du lịch..."} sx={{ flexGrow: 1, fontSize: 15 }} inputProps={{ "aria-label": "Tìm kiếm" }} />
          {total !== undefined && <Box sx={{ px: 2.5, height: 42, borderRadius: 6, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14, background: SITE.gradientCoral }}>{total.toLocaleString("vi-VN")} kết quả</Box>}
        </Box>
      </PageHero>

      <SiteContainer sx={{ mt: -3 }}>
        <Box sx={{ p: 2.5, mb: 4, borderRadius: 4, bgcolor: "#fff", boxShadow: SITE.shadow }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
            <Stack direction="row" spacing={1}>
              {([["landmarks", "Di tích, thắng cảnh", <AccountBalanceIcon key="a" sx={{ fontSize: 20 }} />], ["destinations", "Địa điểm du lịch", <MountainMark key="b" size={22} />]] as const).map(([value, label, icon]) => (
                <Button key={value} onClick={() => switchTab(value)} startIcon={icon} sx={{ px: 2.5, height: 42, borderRadius: 6, fontWeight: 700, color: tab === value ? "#fff" : SITE.brandDark, background: tab === value ? SITE.gradientBrand : "rgba(14,124,91,0.08)", "&:hover": { filter: "brightness(1.05)", background: tab === value ? SITE.gradientBrand : "rgba(14,124,91,0.16)" } }}>
                  {label}
                </Button>
              ))}
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Autocomplete
                size="small"
                sx={{ minWidth: 230, "& .MuiOutlinedInput-root": { borderRadius: 5 } }}
                options={provinces}
                value={provinces.find((p) => p.code === provinceCode) ?? null}
                getOptionLabel={(p) => p.name}
                isOptionEqualToValue={(a, b) => a.code === b.code}
                onChange={(_, p) => setProvinceCode(p?.code ?? null)}
                renderInput={(ps) => <TextField {...ps} placeholder="Tất cả tỉnh, thành" />}
                noOptionsText="Không có kết quả"
              />
              <FormControlLabel control={<Switch checked={onlyImage} onChange={(e) => setOnlyImage(e.target.checked)} color="success" />} label={<Typography sx={{ fontSize: 13, fontWeight: 600 }}>Có ảnh</Typography>} />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Chip label="Tất cả" onClick={() => setCategory("")} sx={{ fontWeight: 700, bgcolor: category === "" ? SITE.coral : "rgba(255,107,74,0.1)", color: category === "" ? "#fff" : SITE.coral, "&:hover": { bgcolor: category === "" ? SITE.coral : "rgba(255,107,74,0.2)" } }} />
            {categories.map((c) => (
              <Chip key={c} label={c} onClick={() => setCategory(c === category ? "" : c)} sx={{ fontWeight: 600, bgcolor: category === c ? SITE.coral : "rgba(255,107,74,0.1)", color: category === c ? "#fff" : SITE.coral, "&:hover": { bgcolor: category === c ? SITE.coral : "rgba(255,107,74,0.2)" } }} />
            ))}
          </Stack>
        </Box>

        {active.error && <Alert severity="error">{(active.error as Error).message}</Alert>}
        {active.isPending ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <CircularProgress sx={{ color: SITE.brand }} />
          </Box>
        ) : empty ? (
          <Box sx={{ py: 9, textAlign: "center" }}>
            <Typography sx={{ fontFamily: SITE.serif, fontSize: 26, color: SITE.ink }}>Không tìm thấy kết quả</Typography>
            <Typography sx={{ color: SITE.muted, mt: 1 }}>Thử đổi từ khóa, bỏ bớt bộ lọc hoặc tắt &quot;Có ảnh&quot;.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" } }}>
            {tab === "landmarks"
              ? lmItems.map((l) => <PlaceTile key={l.id} kind="LANDMARK" id={l.id} title={l.name} image={l.urlImage} badge={l.category} location={l.address || provinceName(l.provinceCode)} description={l.description} />)
              : dsItems.map((d) => <PlaceTile key={d.id} kind="DESTINATION" id={d.id} title={d.name} image={d.urlImage} badge={d.type} badgeColor="rgba(26,166,183,0.92)" location={d.address || provinceName(d.provinceCode)} description={d.description} />)}
          </Box>
        )}
        {active.hasNextPage && (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button onClick={() => active.fetchNextPage()} disabled={active.isFetchingNextPage} sx={{ px: 5, height: 48, borderRadius: 6, fontSize: 15, color: "#fff", background: SITE.gradientBrand, boxShadow: "0 10px 24px rgba(14,124,91,0.35)", "&:hover": { filter: "brightness(1.08)" } }}>
              {active.isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
            </Button>
          </Box>
        )}
      </SiteContainer>
    </SiteShell>
  );
}
