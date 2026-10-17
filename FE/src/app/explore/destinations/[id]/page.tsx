"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, CircularProgress } from "@mui/material";
import PlaceDetail, { InfoGrid } from "@/components/site/PlaceDetail";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { SITE } from "@/components/site/tokens";
import { destinationApi } from "@/lib/api";
import { useProvinces } from "@/lib/useProvinces";

/** Chi tiết địa điểm du lịch: công khai, chỉ xem. */
export default function DestinationPublicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { provinces } = useProvinces();
  const { data: d, isPending, error } = useQuery({ queryKey: ["destination", id], queryFn: () => destinationApi.get(id) });

  if (isPending || error || !d) {
    return (
      <SiteShell>
        <SiteContainer sx={{ pt: 18, minHeight: 500, textAlign: "center" }}>
          {isPending ? <CircularProgress sx={{ color: SITE.brand }} /> : <Alert severity="error">{error ? (error as Error).message : "Không tìm thấy địa điểm này"}</Alert>}
        </SiteContainer>
      </SiteShell>
    );
  }

  const province = provinces.find((p) => p.code === d.provinceCode)?.name;
  const hasCoords = d.latitude != null && d.longitude != null;

  return (
    <PlaceDetail
      kind="DESTINATION"
      id={d.id}
      title={d.name}
      backHref="/explore?tab=destinations"
      backLabel="Địa điểm du lịch"
      heroImage={d.urlImage || undefined}
      chips={[d.type]}
      address={[d.address, province].filter(Boolean).join(" · ")}
      lead={d.description}
      gallery={d.urlImage ? [d.urlImage] : []}
      mapHref={hasCoords ? `/map?destinations=1&lat=${d.latitude}&lng=${d.longitude}&province=${d.provinceCode}` : undefined}
    >
      <InfoGrid
        items={[
          ["Loại hình", d.type],
          ["Thời điểm đẹp nhất", d.bestSeason],
          ["Tỉnh, thành phố", province],
        ]}
      />
    </PlaceDetail>
  );
}
