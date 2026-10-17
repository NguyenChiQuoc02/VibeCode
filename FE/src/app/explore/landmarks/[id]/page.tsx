"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import PlaceDetail, { InfoGrid } from "@/components/site/PlaceDetail";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { SITE } from "@/components/site/tokens";
import { landmarkApi } from "@/lib/api";
import { useProvinces } from "@/lib/useProvinces";

/** Chi tiết di tích, danh lam thắng cảnh: công khai, chỉ xem. */
export default function LandmarkPublicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { provinces } = useProvinces();
  const { data: l, isPending, error } = useQuery({ queryKey: ["landmark", id], queryFn: () => landmarkApi.get(id) });

  if (isPending || error || !l || l.status === "DELETED") {
    return (
      <SiteShell>
        <SiteContainer sx={{ pt: 18, minHeight: 500, textAlign: "center" }}>
          {isPending ? <CircularProgress sx={{ color: SITE.brand }} /> : <Alert severity="error">{error ? (error as Error).message : "Không tìm thấy địa danh này"}</Alert>}
        </SiteContainer>
      </SiteShell>
    );
  }

  const province = provinces.find((p) => p.code === l.provinceCode)?.name;
  const images = l.images && l.images.length > 0 ? l.images : l.urlImage ? [l.urlImage] : [];
  const hasCoords = l.latitude != null && l.longitude != null;

  return (
    <PlaceDetail
      kind="LANDMARK"
      id={l.id}
      title={l.name}
      backHref="/explore?tab=landmarks"
      backLabel="Di tích, thắng cảnh"
      heroImage={images[0]}
      chips={[l.category, l.recognitionLevel ?? ""]}
      address={[l.address, province].filter(Boolean).join(" · ")}
      lead={l.description}
      gallery={images}
      mapHref={hasCoords ? `/map?landmarks=1&lat=${l.latitude}&lng=${l.longitude}&province=${l.provinceCode}` : undefined}
    >
      <InfoGrid
        items={[
          ["Phân loại", l.category],
          ["Cấp công nhận", l.recognitionLevel],
          ["Năm công nhận", l.recognitionYear ? String(l.recognitionYear) : undefined],
          ["Diện tích", l.areaKm2 ? `${l.areaKm2} km²` : undefined],
          ["Tỉnh, thành phố", province],
        ]}
      />
      {l.detail && (
        <Box>
          <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 24, color: SITE.ink, mb: 1.5 }}>Giới thiệu</Typography>
          <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.9, color: SITE.ink }}>{l.detail}</Typography>
        </Box>
      )}
      {l.highlights && l.highlights.length > 0 && (
        <Box>
          <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 24, color: SITE.ink, mb: 1.5 }}>Điểm nổi bật</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {l.highlights.map((h) => (
              <Chip key={h} label={h} sx={{ fontWeight: 600, bgcolor: "rgba(14,124,91,0.1)", color: SITE.brandDark }} />
            ))}
          </Stack>
        </Box>
      )}
    </PlaceDetail>
  );
}
