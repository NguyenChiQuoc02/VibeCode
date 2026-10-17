"use client";

import Minesweeper from "@/components/game/Minesweeper";
import PageHero from "@/components/site/PageHero";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { HERO_IMAGES } from "@/components/site/tokens";

/** Trang game giải trí: dò mìn. Công khai, không cần đăng nhập. */
export default function GamePage() {
  return (
    <SiteShell>
      <PageHero image={HERO_IMAGES.dalat} eyebrow="Giải trí cùng VietJourney" title="Dò mìn" subtitle="Một ván nhanh giữa những chuyến đi: rà soát bãi mìn mà không chạm phải quả nào." height={300} />
      <SiteContainer sx={{ mt: -2 }}>
        <Minesweeper />
      </SiteContainer>
    </SiteShell>
  );
}
