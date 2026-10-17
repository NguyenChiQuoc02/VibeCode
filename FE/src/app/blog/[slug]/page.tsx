"use client";

import { useParams } from "next/navigation";
import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScheduleIcon from "@mui/icons-material/ScheduleOutlined";
import PlaceTile from "@/components/site/PlaceTile";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { SITE } from "@/components/site/tokens";
import TourCard from "@/components/tour/TourCard";
import { landmarkApi, tourApi } from "@/lib/api";
import { BLOG_POSTS, findPost } from "@/lib/blogPosts";
import { formatDate } from "@/lib/tourFormat";

/** Bài viết blog: công khai; cuối bài gợi ý di sản và tour lấy từ dữ liệu hệ thống. */
export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = findPost(slug);
  const heritage = useQuery({
    queryKey: ["blog", "heritage"],
    queryFn: async () => (await landmarkApi.list({ category: "Di sản thế giới", status: "ACTIVE", hasImage: true, page: 0, size: 4 })).items,
    enabled: !!post?.showHeritage,
  });
  const tours = useQuery({ queryKey: ["tours", "upcoming", "blog"], queryFn: () => tourApi.list({ upcoming: true, limit: 3 }) });

  if (!post) {
    return (
      <SiteShell>
        <SiteContainer sx={{ pt: 18, minHeight: 500 }}>
          <Alert severity="error">Không tìm thấy bài viết này.</Alert>
        </SiteContainer>
      </SiteShell>
    );
  }

  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <SiteShell>
      <Box sx={{ position: "relative", minHeight: { xs: 340, md: 420 }, display: "flex", alignItems: "flex-end", color: "#fff", backgroundColor: SITE.brandDark, backgroundImage: `linear-gradient(180deg, rgba(4,28,25,0.5) 0%, rgba(4,28,25,0.15) 40%, rgba(4,28,25,0.88) 100%), url("${post.image}")`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <Box sx={{ maxWidth: 900, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, pb: { xs: 4, md: 6 }, pt: 14 }}>
          <Box component={NextLink} href="/blog" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mb: 2, px: 1.75, py: 0.6, borderRadius: 5, fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none", bgcolor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} /> Blog
          </Box>
          <Chip label={post.category} size="small" sx={{ display: "flex", width: "fit-content", mb: 1.5, fontWeight: 700, color: "#fff", background: SITE.gradientCoral }} />
          <Typography component="h1" sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: { xs: 28, md: 42 }, lineHeight: 1.18, textShadow: "0 3px 18px rgba(0,0,0,0.5)" }}>{post.title}</Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.5, opacity: 0.92 }}>
            <Typography sx={{ fontSize: 13 }}>{formatDate(post.date)}</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ScheduleIcon sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: 13 }}>{post.readMinutes} phút đọc</Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 760, mx: "auto", px: { xs: 2, md: 3 }, pt: 6 }}>
        <Typography sx={{ fontFamily: SITE.serif, fontSize: { xs: 19, md: 22 }, lineHeight: 1.7, color: SITE.muted, fontStyle: "italic", mb: 4 }}>{post.excerpt}</Typography>
        {post.blocks.map((b, i) => {
          if (b.type === "list") {
            return (
              <Box key={i} component="ul" sx={{ my: 2, pl: 3, "& li": { fontSize: 16.5, lineHeight: 1.85, color: SITE.ink, mb: 0.75 }, "& li::marker": { color: SITE.coral } }}>
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </Box>
            );
          }
          if (b.type === "h2") return <Typography key={i} component="h2" sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 26, color: SITE.ink, mt: 4.5, mb: 1.5 }}>{b.text}</Typography>;
          if (b.type === "p") return <Typography key={i} sx={{ fontSize: 17, lineHeight: 1.9, color: SITE.ink, mb: 2 }}>{b.text}</Typography>;
          if (b.type === "quote") return <Box key={i} sx={{ my: 4, pl: 3, borderLeft: `4px solid ${SITE.coral}` }}><Typography sx={{ fontFamily: SITE.serif, fontSize: 24, lineHeight: 1.5, fontStyle: "italic", color: SITE.brandDark }}>{b.text}</Typography></Box>;
          return null;
        })}
      </Box>

      <SiteContainer sx={{ mt: 7 }}>
        {post.showHeritage && (heritage.data?.length ?? 0) > 0 && (
          <Box sx={{ mb: 7 }}>
            <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 26, color: SITE.ink, mb: 3 }}>Di sản thế giới trong hệ thống</Typography>
            <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" } }}>
              {heritage.data!.map((l) => <PlaceTile key={l.id} kind="LANDMARK" id={l.id} title={l.name} image={l.urlImage} badge={l.category} location={l.address} />)}
            </Box>
          </Box>
        )}

        {(tours.data?.length ?? 0) > 0 && (
          <Box sx={{ mb: 7 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
              <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 26, color: SITE.ink }}>Gợi ý tour cho bạn</Typography>
              <Button component={NextLink} href="/tours" sx={{ fontWeight: 700, color: SITE.coral }}>Xem tất cả</Button>
            </Stack>
            <Box sx={{ display: "grid", gap: 3.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } }}>
              {tours.data!.map((t) => <TourCard key={t.id} tour={t} />)}
            </Box>
          </Box>
        )}

        <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 26, color: SITE.ink, mb: 3 }}>Bài viết khác</Typography>
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {others.map((p) => (
            <Box key={p.slug} component={NextLink} href={`/blog/${p.slug}`} sx={{ display: "block", p: 2.5, borderRadius: 4, bgcolor: "#fff", textDecoration: "none", boxShadow: "0 4px 16px rgba(11,61,53,0.08)", transition: "transform .2s, box-shadow .2s", "&:hover": { transform: "translateY(-3px)", boxShadow: SITE.shadow } }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: SITE.coral }}>{p.category}</Typography>
              <Typography sx={{ mt: 0.5, fontFamily: SITE.serif, fontWeight: 700, fontSize: 18, lineHeight: 1.35, color: SITE.ink }}>{p.title}</Typography>
            </Box>
          ))}
        </Box>
      </SiteContainer>
    </SiteShell>
  );
}
