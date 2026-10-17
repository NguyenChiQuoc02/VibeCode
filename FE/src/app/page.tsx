"use client";

import { useState } from "react";
import { Box, ButtonBase, Stack } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TourIcon from "@mui/icons-material/Tour";
import CtaBanner from "@/components/landing/CtaBanner";
import LandingHeader, { BRAND } from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import { MountainMark } from "@/components/landing/Logo";
import PlaceSection from "@/components/landing/PlaceSection";
import TourSection from "@/components/landing/TourSection";
import { largeImage, useFeatured } from "@/components/landing/featured";

type Tab = "landmarks" | "destinations" | "tours";

/** Trang chủ công khai (landing page). Dữ liệu thẻ lấy từ business-service. */
export default function LandingPage() {
  const { landmarks, destinations } = useFeatured();
  const [tab, setTab] = useState<Tab>("landmarks");

  const go = (t: Tab) => {
    setTab(t);
    document.getElementById(t)?.scrollIntoView({ behavior: "smooth" });
  };

  // Ảnh nền dải cuối trang: ảnh Fansipan nếu có.
  const bannerImage = largeImage(landmarks.find((p) => p.title === "Fansipan")?.image);

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh" }}>
      <LandingHeader />
      <LandingHero />

      <Stack direction="row" sx={{ mx: "auto", mt: 1, width: { xs: "calc(100% - 32px)", sm: 720 }, p: 0, borderRadius: 8, bgcolor: "#fff", boxShadow: "0 4px 18px rgba(16,40,60,0.1)", border: "1px solid rgba(145,158,171,0.25)", overflow: "hidden", position: "relative" }}>
        <ButtonBase
          onClick={() => go("landmarks")}
          sx={{ flex: 1, height: 46, gap: 1.25, borderRadius: 8, fontSize: 13, fontWeight: 700, bgcolor: tab === "landmarks" ? BRAND : "#fff", color: tab === "landmarks" ? "#fff" : "#1C252E" }}
        >
          <AccountBalanceIcon sx={{ fontSize: 22 }} /> Di tích danh lam thắng cảnh
        </ButtonBase>
        <ButtonBase
          onClick={() => go("destinations")}
          sx={{ flex: 1, height: 46, gap: 1.25, borderRadius: 8, fontSize: 13, fontWeight: 700, bgcolor: tab === "destinations" ? BRAND : "#fff", color: tab === "destinations" ? "#fff" : "#1C252E" }}
        >
          <MountainMark size={26} /> Địa điểm du lịch
        </ButtonBase>
        <ButtonBase
          onClick={() => go("tours")}
          sx={{ flex: 1, height: 46, gap: 1.25, borderRadius: 8, fontSize: 13, fontWeight: 700, bgcolor: tab === "tours" ? BRAND : "#fff", color: tab === "tours" ? "#fff" : "#1C252E" }}
        >
          <TourIcon sx={{ fontSize: 22 }} /> Tour du lịch
        </ButtonBase>
      </Stack>

      <PlaceSection
        id="landmarks"
        icon={<AccountBalanceIcon />}
        title="Di tích danh lam thắng cảnh"
        description="Khám phá những di sản văn hóa, danh lam thắng cảnh nổi tiếng, mang đậm dấu ấn lịch sử và thiên nhiên Việt Nam."
        href="/explore?tab=landmarks"
        places={landmarks}
      />
      <PlaceSection
        id="destinations"
        icon={<MountainMark size={42} />}
        title="Địa điểm du lịch"
        description="Từ những bãi biển xanh mát, những bản làng bình yên đến những thành phố sôi động, Việt Nam luôn có một điểm đến phù hợp với bạn."
        href="/explore?tab=destinations"
        places={destinations}
      />
      <TourSection />

      <CtaBanner image={bannerImage} />
    </Box>
  );
}
