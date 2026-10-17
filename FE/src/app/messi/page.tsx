import type { Metadata } from "next";
import { Box, Chip, Link, Typography } from "@mui/material";
import PageHero from "@/components/site/PageHero";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { SITE } from "@/components/site/tokens";
import messi from "@/data/messi.json";

export const metadata: Metadata = { title: "Lionel Messi" };

// Các mục là danh sách thô khó đọc, đã có phần số liệu riêng ở trên.
const SKIP_SECTIONS = new Set(["Thống kê sự nghiệp", "Danh hiệu"]);

function age(birth: string) {
  const b = new Date(birth);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ p: 2, borderRadius: 3, bgcolor: "#fff", boxShadow: SITE.shadow }}>
      <Typography sx={{ fontSize: 12.5, color: SITE.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 700, color: SITE.ink, fontFamily: SITE.serif, fontSize: 16, overflowWrap: "anywhere" }}>{value}</Typography>
    </Box>
  );
}

function H2({ children }: { children: string }) {
  return <Typography component="h2" sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: { xs: 26, md: 32 }, color: SITE.ink, mb: 2 }}>{children}</Typography>;
}

/** Trang công khai về Lionel Messi. Dữ liệu do script/crawl/crawl_messi.py thu thập (Wikipedia, Wikidata). */
export default function MessiPage() {
  const clubs = messi.clubs.filter((c) => !c.label.includes("U-") && !c.label.includes("Barcelona B") && !c.label.includes("Barcelona C"));
  const awards = messi.awards.filter((a) => /bóng vàng|Ballon|Golden|giày vàng|Best|FIFA|UEFA|Onze/i.test(a.label)).slice(0, 14);
  const birth = new Date(messi.birthDate).toLocaleDateString("vi-VN");

  return (
    <SiteShell>
      <PageHero eyebrow={messi.nickname} title={messi.name} subtitle={messi.description ?? undefined} height={300} />

      <SiteContainer sx={{ mt: { xs: 2, md: -6 }, pb: 8 }}>
        <Box sx={{ display: "grid", gap: 5, gridTemplateColumns: { xs: "1fr", md: "300px minmax(0, 1fr)" }, alignItems: "start" }}>
          <Box sx={{ position: { md: "sticky" }, top: 90, minWidth: 0 }}>
            {messi.image && (
              <Box component="img" src={messi.thumbnail ?? messi.image} alt={messi.name} sx={{ width: "100%", borderRadius: 4, boxShadow: SITE.shadow, display: "block", border: "4px solid #fff" }} />
            )}
            <Box sx={{ mt: 2, display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr", "& > *": { minWidth: 0 } }}>
              <Fact label="Sinh ngày" value={birth} />
              <Fact label="Tuổi" value={String(age(messi.birthDate))} />
              <Fact label="Chiều cao" value={`${messi.heightCm} cm`} />
              <Fact label="Nơi sinh" value={messi.birthPlace.join(", ")} />
            </Box>
            <Box sx={{ mt: 1.5, display: "flex", gap: 0.8, flexWrap: "wrap" }}>
              {messi.positions.filter((p) => p.length > 1).map((p) => <Chip key={p} label={p} size="small" sx={{ bgcolor: SITE.mist, color: SITE.brandDark, fontWeight: 600 }} />)}
              {messi.citizenship.filter((c) => c.length > 2).map((c) => <Chip key={c} label={c} size="small" variant="outlined" />)}
            </Box>
          </Box>

          <Box sx={{ minWidth: 0, maxWidth: 820, pt: { md: 7 } }}>
            <Typography sx={{ fontSize: 17.5, lineHeight: 1.9, color: SITE.ink }}>{messi.summary}</Typography>

            <Box sx={{ mt: 5 }}>
              <H2>Sự nghiệp câu lạc bộ và đội tuyển</H2>
              <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                {clubs.map((c) => (
                  <Box key={c.label + c.from} sx={{ p: 2.2, borderRadius: 3, bgcolor: SITE.mist, border: `1px solid ${SITE.line}` }}>
                    <Typography sx={{ fontWeight: 700, color: SITE.ink, fontSize: 15, lineHeight: 1.35, minHeight: 40 }}>{c.label.replace("Đội tuyển bóng đá quốc gia", "Đội tuyển quốc gia")}</Typography>
                    <Typography sx={{ fontSize: 13.5, color: SITE.muted }}>{c.from} – {c.to ?? "nay"}</Typography>
                    <Box sx={{ mt: 1, display: "flex", gap: 3 }}>
                      <Box>
                        <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 28, color: SITE.brand, lineHeight: 1 }}>{c.apps}</Typography>
                        <Typography sx={{ fontSize: 12, color: SITE.muted }}>trận</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 28, color: SITE.coral, lineHeight: 1 }}>{c.goals}</Typography>
                        <Typography sx={{ fontSize: 12, color: SITE.muted }}>bàn thắng</Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 5 }}>
              <H2>Giải thưởng nổi bật</H2>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {awards.map((a) => (
                  <Chip key={a.label} label={a.years.length > 1 ? `${a.label} ×${a.years.length}` : a.years[0] ? `${a.label} (${a.years[0]})` : a.label} sx={{ bgcolor: "#FFF1D6", color: SITE.ink, fontWeight: 600, maxWidth: "100%", height: "auto", py: 0.6, "& .MuiChip-label": { whiteSpace: "normal" } }} />
                ))}
              </Box>
            </Box>

            {messi.sections.filter((s) => !SKIP_SECTIONS.has(s.title)).map((s) => (
              <Box key={s.title} sx={{ mt: 5 }}>
                <H2>{s.title}</H2>
                {s.paragraphs.slice(0, 2).map((p, i) => (
                  <Typography key={i} sx={{ mb: 1.8, fontSize: 16, lineHeight: 1.8, color: SITE.ink }}>{p}</Typography>
                ))}
              </Box>
            ))}

            <Box sx={{ mt: 5 }}>
              <H2>Hình ảnh</H2>
              <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
                {messi.images.map((im) => (
                  <Box key={im.url} component="a" href={im.page ?? im.url} target="_blank" rel="noopener noreferrer" sx={{ display: "block", borderRadius: 3, overflow: "hidden", aspectRatio: "4 / 3" }}>
                    <Box component="img" src={im.url} alt={im.caption || messi.name} loading="lazy" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </Box>
                ))}
              </Box>
            </Box>

            <Typography sx={{ mt: 5, fontSize: 13, color: SITE.muted }}>
              {messi.attribution} Cập nhật {new Date(messi.crawledAt).toLocaleDateString("vi-VN")}.{" "}
              {messi.wikipedia && <Link href={messi.wikipedia} target="_blank" rel="noopener noreferrer">Xem bài gốc</Link>}
            </Typography>
          </Box>
        </Box>
      </SiteContainer>
    </SiteShell>
  );
}
