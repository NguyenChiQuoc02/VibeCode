"use client";

import NextLink from "next/link";
import { Box, Chip, Stack, Typography } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/ScheduleOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PageHero from "@/components/site/PageHero";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { HERO_IMAGES, SITE } from "@/components/site/tokens";
import { BLOG_POSTS, BlogPost } from "@/lib/blogPosts";
import { formatDate } from "@/lib/tourFormat";

function Meta({ post, light }: { post: BlogPost; light?: boolean }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: light ? "rgba(255,255,255,0.9)" : SITE.muted }}>
      <Typography sx={{ fontSize: 12 }}>{formatDate(post.date)}</Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <ScheduleIcon sx={{ fontSize: 14 }} />
        <Typography sx={{ fontSize: 12 }}>{post.readMinutes} phút đọc</Typography>
      </Stack>
    </Stack>
  );
}

/** Blog du lịch: công khai cho mọi khách. */
export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;
  return (
    <SiteShell>
      <PageHero image={HERO_IMAGES.dalat} eyebrow="Cảm hứng cho chuyến đi" title="Blog du lịch" subtitle="Cẩm nang, kinh nghiệm và câu chuyện về những vùng đất bạn sắp đặt chân đến." height={340} />
      <SiteContainer sx={{ mt: -2 }}>
        <Box
          component={NextLink}
          href={`/blog/${featured.slug}`}
          sx={{ position: "relative", display: "block", minHeight: { xs: 320, md: 400 }, borderRadius: 6, overflow: "hidden", textDecoration: "none", color: "#fff", boxShadow: SITE.shadowHover, backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.85) 100%), url("${featured.image}")`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform .3s", "&:hover": { transform: "translateY(-4px)" } }}
        >
          <Box sx={{ position: "absolute", left: { xs: 20, md: 40 }, right: { xs: 20, md: 40 }, bottom: { xs: 24, md: 36 }, maxWidth: 720 }}>
            <Chip label={`Nổi bật · ${featured.category}`} size="small" sx={{ mb: 1.5, fontWeight: 700, color: "#fff", background: SITE.gradientCoral }} />
            <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: { xs: 26, md: 38 }, lineHeight: 1.2, textShadow: "0 3px 14px rgba(0,0,0,0.5)" }}>{featured.title}</Typography>
            <Typography sx={{ mt: 1.25, fontSize: 15, lineHeight: 1.6, opacity: 0.95, display: { xs: "none", sm: "block" } }}>{featured.excerpt}</Typography>
            <Box sx={{ mt: 1.5 }}>
              <Meta post={featured} light />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 5, display: "grid", gap: 3.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } }}>
          {rest.map((p) => (
            <Box key={p.slug} component={NextLink} href={`/blog/${p.slug}`} sx={{ display: "block", borderRadius: `${SITE.radius}px`, overflow: "hidden", bgcolor: "#fff", textDecoration: "none", color: "inherit", boxShadow: SITE.shadow, transition: "transform .25s, box-shadow .25s", "&:hover": { transform: "translateY(-6px)", boxShadow: SITE.shadowHover }, "&:hover img": { transform: "scale(1.08)" } }}>
              <Box sx={{ position: "relative", height: 200, overflow: "hidden", background: SITE.gradientSky }}>
                <Box component="img" src={p.image} alt={p.title} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s ease" }} />
                <Chip label={p.category} size="small" sx={{ position: "absolute", top: 12, left: 12, fontWeight: 700, color: "#fff", bgcolor: "rgba(14,124,91,0.92)" }} />
              </Box>
              <Box sx={{ p: 2.5 }}>
                <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 19, lineHeight: 1.3, color: SITE.ink, minHeight: 50 }}>{p.title}</Typography>
                <Typography sx={{ mt: 1, fontSize: 13.5, lineHeight: 1.65, color: SITE.muted, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.excerpt}</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, pt: 1.5, borderTop: `1px dashed ${SITE.line}` }}>
                  <Meta post={p} />
                  <ArrowForwardIcon sx={{ fontSize: 18, color: SITE.coral }} />
                </Stack>
              </Box>
            </Box>
          ))}
        </Box>
      </SiteContainer>
    </SiteShell>
  );
}
