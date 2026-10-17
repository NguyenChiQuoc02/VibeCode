"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import FavoriteButton from "@/components/site/FavoriteButton";
import PageHero from "@/components/site/PageHero";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { HERO_IMAGES, SITE } from "@/components/site/tokens";
import { useAuth } from "@/context/AuthContext";
import { FavoriteItem, FavoriteType, favoriteApi } from "@/lib/api";
import { rememberNext } from "@/lib/loginRedirect";
import { formatVnd } from "@/lib/tourFormat";

const META: Record<FavoriteType, { label: string; color: string; href: (id: string) => string }> = {
  TOUR: { label: "Tour", color: SITE.coral, href: (id) => `/tours/${id}` },
  LANDMARK: { label: "Di tích", color: SITE.brand, href: (id) => `/explore/landmarks/${id}` },
  DESTINATION: { label: "Điểm đến", color: SITE.ocean, href: (id) => `/explore/destinations/${id}` },
};

function FavCard({ item }: { item: FavoriteItem }) {
  const m = META[item.type];
  return (
    <Box
      component={NextLink}
      href={m.href(item.targetId)}
      sx={{ display: "block", borderRadius: 4, overflow: "hidden", bgcolor: "#fff", textDecoration: "none", color: "inherit", boxShadow: SITE.shadow, transition: "transform .25s, box-shadow .25s", "&:hover": { transform: "translateY(-6px)", boxShadow: SITE.shadowHover }, "&:hover img": { transform: "scale(1.08)" } }}
    >
      <Box sx={{ position: "relative", height: 190, overflow: "hidden", background: SITE.gradientSky }}>
        {item.image && <Box component="img" src={item.image} alt={item.name} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .6s ease" }} />}
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)" }} />
        <Box sx={{ position: "absolute", top: 12, left: 12, px: 1.5, py: 0.4, borderRadius: 5, fontSize: 11, fontWeight: 700, color: "#fff", bgcolor: m.color }}>{m.label}</Box>
        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
          <FavoriteButton type={item.type} id={item.targetId} />
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 17, lineHeight: 1.3, color: SITE.ink, height: 44, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.name}</Typography>
        {item.subtitle && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.75, color: SITE.muted }}>
            {item.type !== "TOUR" && <PlaceIcon sx={{ fontSize: 15 }} />}
            <Typography noWrap sx={{ fontSize: 12.5 }}>{item.subtitle}</Typography>
          </Box>
        )}
        {item.price !== undefined && item.price !== null && <Typography sx={{ mt: 1, fontWeight: 800, fontSize: 18, color: SITE.coral }}>{formatVnd(item.price)}</Typography>}
      </Box>
    </Box>
  );
}

/** Danh sách yêu thích của người dùng, gồm tour, di tích và địa điểm du lịch. */
export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"ALL" | FavoriteType>("ALL");

  useEffect(() => {
    if (!loading && !user) {
      rememberNext("/favorites");
      router.replace("/login");
    }
  }, [loading, user, router]);

  const { data = [], isPending, error } = useQuery({ queryKey: ["favorites", "list"], queryFn: favoriteApi.list, enabled: !!user });
  const list = useMemo(() => data.filter((f) => tab === "ALL" || f.type === tab), [data, tab]);
  const count = (t: FavoriteType) => data.filter((f) => f.type === t).length;

  if (loading || !user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: SITE.brand }} />
      </Box>
    );
  }

  return (
    <SiteShell>
      <PageHero image={HERO_IMAGES.phuquoc} eyebrow="Những nơi bạn thương" title="Yêu thích của tôi" subtitle="Lưu lại các tour, di tích và điểm đến bạn quan tâm để xem lại bất cứ lúc nào." height={300} />
      <SiteContainer sx={{ mt: -2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 700, textTransform: "none", fontSize: 14 }, "& .MuiTabs-indicator": { height: 3, borderRadius: 2, background: SITE.gradientCoral } }}>
          <Tab value="ALL" label={`Tất cả (${data.length})`} />
          <Tab value="TOUR" label={`Tour (${count("TOUR")})`} />
          <Tab value="LANDMARK" label={`Di tích (${count("LANDMARK")})`} />
          <Tab value="DESTINATION" label={`Điểm đến (${count("DESTINATION")})`} />
        </Tabs>

        {error && <Alert severity="error">{(error as Error).message}</Alert>}
        {isPending ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <CircularProgress sx={{ color: SITE.brand }} />
          </Box>
        ) : list.length === 0 ? (
          <Box sx={{ py: 9, textAlign: "center" }}>
            <Typography sx={{ fontFamily: SITE.serif, fontSize: 26, color: SITE.ink }}>{data.length === 0 ? "Bạn chưa lưu mục yêu thích nào" : "Chưa có mục nào trong nhóm này"}</Typography>
            <Typography sx={{ color: SITE.muted, mt: 1 }}>Bấm biểu tượng trái tim trên các thẻ để lưu lại.</Typography>
            <Box sx={{ mt: 2.5, display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
              <Button component={NextLink} href="/tours" sx={{ px: 3.5, borderRadius: 6, color: "#fff", background: SITE.gradientCoral }}>Xem tour</Button>
              <Button component={NextLink} href="/explore" variant="outlined" sx={{ px: 3.5, borderRadius: 6 }}>Khám phá điểm đến</Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" } }}>
            {list.map((f) => (
              <FavCard key={`${f.type}:${f.targetId}`} item={f} />
            ))}
          </Box>
        )}
      </SiteContainer>
    </SiteShell>
  );
}
