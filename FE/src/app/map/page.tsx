"use client";

import { Box } from "@mui/material";
import MapExplorer from "@/components/MapExplorer";
import PageHero from "@/components/site/PageHero";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { HERO_IMAGES } from "@/components/site/tokens";

/** Bản đồ du lịch công khai: ranh giới tỉnh, xã và các điểm di tích, địa điểm du lịch. Chỉ xem. */
export default function PublicMapPage() {
  return (
    <SiteShell>
      <PageHero image={HERO_IMAGES.halong} eyebrow="Tấm bản đồ di sản" title="Bản đồ du lịch Việt Nam" subtitle="Chọn tỉnh, thành, bật lớp di tích hoặc địa điểm du lịch để xem vị trí trên bản đồ." height={300} />
      <SiteContainer sx={{ mt: -2 }}>
        <Box sx={{ p: 2.5, borderRadius: 5, bgcolor: "#fff", boxShadow: "0 14px 36px rgba(11,61,53,0.16)" }}>
          <MapExplorer height="calc(100vh - 340px)" />
        </Box>
      </SiteContainer>
    </SiteShell>
  );
}
