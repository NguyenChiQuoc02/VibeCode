"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, IconButton, Rating, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCarFilledOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUserOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcardOutlined";
import SellIcon from "@mui/icons-material/SellOutlined";
import CreditScoreIcon from "@mui/icons-material/CreditScoreOutlined";
import CarCard from "@/components/cars/CarCard";
import CarsShell from "@/components/cars/CarsShell";
import { AUTO } from "@/components/cars/theme";
import { carApi, carBrandApi } from "@/lib/api";
import { carImage } from "@/lib/carFormat";

const FEATURES = [
  { icon: <DirectionsCarIcon />, title: "Xe chính hãng", text: "Cam kết 100% xe chính hãng, chất lượng vượt trội" },
  { icon: <VerifiedUserIcon />, title: "Bảo hành dài hạn", text: "An tâm trên mọi hành trình với chính sách bảo hành uy tín" },
  { icon: <PaymentsIcon />, title: "Hỗ trợ tài chính", text: "Lãi suất ưu đãi, thủ tục nhanh gọn, linh hoạt" },
  { icon: <SupportAgentIcon />, title: "Dịch vụ chuyên nghiệp", text: "Đội ngũ tư vấn tận tâm, hỗ trợ 24/7" },
];

/** Nhận xét mẫu để minh họa bố cục; chưa có chức năng đánh giá xe trong hệ thống. */
const TESTIMONIALS = [
  { name: "Nguyễn Văn Nam", text: "Dịch vụ ở AutoDrive thật sự tuyệt vời. Nhân viên tư vấn nhiệt tình, xe chất lượng, thủ tục nhanh gọn. Tôi rất hài lòng!" },
  { name: "Trần Thị Mai", text: "Tôi đã mua chiếc xe tại đây. Xe chạy rất êm, tiết kiệm nhiên liệu. Sẽ tiếp tục ủng hộ AutoDrive!" },
  { name: "Lê Anh Tuấn", text: "Chính sách bảo hành và hậu mãi quá tốt. Đội ngũ kỹ thuật chuyên nghiệp, luôn hỗ trợ khi tôi cần. Rất đáng tin cậy!" },
];

function Eyebrow({ children, dark = false }: { children: string; dark?: boolean }) {
  return <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: dark ? "rgba(255,255,255,0.85)" : AUTO.red }}>{children}</Typography>;
}

function Hero({ cars }: { cars: { id: string; name: string; urlImage?: string }[] }) {
  const [i, setI] = useState(0);
  const n = cars.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);
  const car = cars[i];
  const pad = (x: number) => String(x).padStart(2, "0");
  return (
    <Box sx={{ position: "relative", minHeight: { xs: 560, md: 680 }, overflow: "hidden", color: "#fff", background: "linear-gradient(100deg, #0B0E14 0%, #1A1F2C 45%, #4A3436 75%, #C8733E 100%)" }}>
      {cars.map((c, k) => (
        <Box
          key={c.id}
          component="img"
          src={carImage(c, 1280)}
          alt={c.name}
          referrerPolicy="no-referrer"
          sx={{ position: "absolute", right: 0, top: 0, width: { xs: "100%", md: "68%" }, height: "100%", objectFit: "cover", opacity: k === i ? 1 : 0, transition: "opacity .8s ease", maskImage: "linear-gradient(90deg, transparent 0%, #000 38%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 38%)" }}
        />
      ))}
      <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,10,15,0.88) 0%, rgba(8,10,15,0.55) 45%, rgba(8,10,15,0.1) 100%), linear-gradient(0deg, rgba(8,10,15,0.5) 0%, transparent 35%)" }} />
      <Box sx={{ position: "relative", px: { xs: 2, md: "7%" }, pt: { xs: 14, md: 20 }, pb: 10, maxWidth: 760 }}>
        <Eyebrow dark>Khám phá thế giới mới</Eyebrow>
        <Typography component="h1" sx={{ mt: 2, fontWeight: 800, fontSize: { xs: 40, md: 58 }, lineHeight: 1.1, letterSpacing: -1 }}>
          Hành trình
          <br />
          bắt đầu từ
          <br />
          những{" "}
          <Box component="span" sx={{ color: AUTO.red, fontStyle: "italic", fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}>
            ước mơ
          </Box>
        </Typography>
        <Typography sx={{ mt: 3, maxWidth: 440, fontSize: 14.5, lineHeight: 1.7, color: "rgba(255,255,255,0.88)" }}>
          AutoDrive mang đến cho bạn những mẫu xe hiện đại nhất, đẳng cấp nhất cùng trải nghiệm lái tuyệt vời nhất.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 4 }}>
          <Button component={NextLink} href="/cars/catalog" variant="contained" endIcon={<ArrowForwardIcon />} sx={{ bgcolor: AUTO.red, borderRadius: 6, px: 3, py: 1.2, fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: AUTO.redDark, boxShadow: "none" } }}>
            Khám phá ngay
          </Button>
          <Button component={NextLink} href={car ? `/cars/${car.id}` : "/cars/catalog"} variant="outlined" startIcon={<PlayCircleOutlineIcon />} sx={{ borderRadius: 6, px: 3, py: 1.2, fontWeight: 600, color: "#fff", borderColor: "rgba(255,255,255,0.7)", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}>
            Xem mẫu xe
          </Button>
        </Stack>
      </Box>
      {n > 1 && (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ position: "absolute", right: { xs: 16, md: "7%" }, bottom: 32 }}>
          <Typography sx={{ fontSize: 14, mr: 1 }}>
            {pad(i + 1)} <Box component="span" sx={{ opacity: 0.55 }}>/ {pad(n)}</Box>
          </Typography>
          <IconButton aria-label="Trước" onClick={() => setI((i - 1 + n) % n)} sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.6)" }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="Sau" onClick={() => setI((i + 1) % n)} sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.6)" }}>
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}
    </Box>
  );
}

/** Landing page AutoDrive. Dữ liệu xe nổi bật và hãng xe lấy từ business-service. */
export default function CarsLandingPage() {
  const featured = useQuery({ queryKey: ["cars", "featured"], queryFn: () => carApi.page({ featured: true, hasImage: true, size: 12 }), staleTime: 60_000 });
  const brands = useQuery({ queryKey: ["car-brands", "top"], queryFn: () => carBrandApi.top(14), staleTime: 60_000 });
  const stats = useQuery({ queryKey: ["cars", "stats"], queryFn: () => carApi.stats(), staleTime: 60_000 });
  const cars = featured.data?.items ?? [];
  const hero = cars.slice(0, 4);
  const promoCar = cars[4] ?? cars[0];

  return (
    <CarsShell overlay>
      <Hero cars={hero} />

      <Box id="services" sx={{ bgcolor: "#fff", px: { xs: 2, md: "7%" }, py: 4, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
        {FEATURES.map((f) => (
          <Stack key={f.title} direction="row" spacing={1.75} alignItems="flex-start">
            <Box sx={{ color: AUTO.ink, mt: 0.25, "& svg": { fontSize: 30 } }}>{f.icon}</Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{f.title}</Typography>
              <Typography sx={{ fontSize: 11.5, color: AUTO.muted, lineHeight: 1.6, mt: 0.25 }}>{f.text}</Typography>
            </Box>
          </Stack>
        ))}
      </Box>

      <Box id="featured" sx={{ bgcolor: "#fff", px: { xs: 2, md: "7%" }, pt: 7, pb: 8 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
          <Box>
            <Eyebrow>Xe bán chạy</Eyebrow>
            <Typography component="h2" sx={{ fontWeight: 800, fontSize: 28, mt: 0.5 }}>Dòng xe nổi bật</Typography>
          </Box>
          <Button component={NextLink} href="/cars/catalog" endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />} sx={{ color: AUTO.ink, fontWeight: 600, fontSize: 12.5 }}>
            Xem tất cả xe
          </Button>
        </Stack>
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
          {cars.slice(0, 8).map((c) => (
            <CarCard key={c.id} car={c} />
          ))}
        </Box>
        {featured.isError && <Typography color="error" sx={{ mt: 2 }}>Không tải được danh sách xe. Hãy kiểm tra business-service.</Typography>}
      </Box>

      <Box id="brands" sx={{ bgcolor: AUTO.bg, px: { xs: 2, md: "7%" }, py: 7 }}>
        <Eyebrow>Thương hiệu</Eyebrow>
        <Typography component="h2" sx={{ fontWeight: 800, fontSize: 28, mt: 0.5, mb: 3 }}>
          Hãng xe trên toàn thế giới{stats.data ? <Box component="span" sx={{ color: AUTO.muted, fontWeight: 500, fontSize: 16 }}> · {stats.data.brands} hãng, {stats.data.total.toLocaleString("vi-VN")} mẫu xe</Box> : null}
        </Typography>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.25}>
          {(brands.data ?? []).map((b) => (
            <Button key={b.id} component={NextLink} href={`/cars/catalog?brand=${encodeURIComponent(b.name)}`} variant="outlined" sx={{ borderRadius: 6, px: 2.25, color: AUTO.ink, bgcolor: "#fff", borderColor: AUTO.line, fontWeight: 600, fontSize: 13, "&:hover": { borderColor: AUTO.red, color: AUTO.red, bgcolor: "#fff" } }}>
              {b.name} <Box component="span" sx={{ ml: 0.75, color: AUTO.muted, fontWeight: 400, fontSize: 11 }}>{b.carCount}</Box>
            </Button>
          ))}
        </Stack>
      </Box>

      <Box id="about" sx={{ position: "relative", overflow: "hidden", color: "#fff", background: "linear-gradient(100deg, #0B0E14 0%, #151A24 60%, #2A1519 100%)", px: { xs: 2, md: "7%" }, py: 9 }}>
        {promoCar?.urlImage && (
          <Box component="img" src={carImage(promoCar, 1000)} alt="" referrerPolicy="no-referrer" sx={{ position: "absolute", right: 0, top: 0, height: "100%", width: { xs: "100%", md: "55%" }, objectFit: "cover", opacity: 0.55, maskImage: "linear-gradient(90deg, transparent 0%, #000 45%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 45%)" }} />
        )}
        <Box sx={{ position: "relative", display: "flex", gap: 4, justifyContent: "space-between", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" } }}>
          <Box sx={{ maxWidth: 520 }}>
            <Eyebrow dark>Ưu đãi đặc biệt</Eyebrow>
            <Typography component="h2" sx={{ mt: 1.5, fontWeight: 800, fontSize: { xs: 28, md: 36 }, lineHeight: 1.2 }}>
              Lái thử miễn phí
              <br />- Nhận ngay quà tặng hấp dẫn
            </Typography>
            <Typography sx={{ mt: 2, fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.85)" }}>
              Trải nghiệm thực tế, cảm nhận sự khác biệt. Đặt lịch lái thử ngay hôm nay để nhận nhiều ưu đãi hấp dẫn từ AutoDrive.
            </Typography>
            <Button component={NextLink} href="/cars/catalog" variant="contained" endIcon={<ArrowForwardIcon />} sx={{ mt: 3, bgcolor: AUTO.red, borderRadius: 6, px: 3, py: 1.2, fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: AUTO.redDark, boxShadow: "none" } }}>
              Đặt lịch lái thử
            </Button>
          </Box>
          <Stack spacing={0} sx={{ minWidth: 270, borderRadius: 2, border: "1px solid rgba(255,255,255,0.14)", bgcolor: "rgba(12,15,21,0.72)", backdropFilter: "blur(8px)", p: 1 }}>
            {[
              { icon: <CardGiftcardIcon />, text: "Tặng ngay bộ phụ kiện cao cấp" },
              { icon: <SellIcon />, text: "Giảm giá lên đến 50 triệu đồng" },
              { icon: <CreditScoreIcon />, text: "Hỗ trợ trả góp lên đến 85%" },
            ].map((o) => (
              <Stack key={o.text} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,0.1)" }}>{o.icon}</Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{o.text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#fff", px: { xs: 2, md: "7%" }, py: 7 }}>
        <Eyebrow>Khách hàng nói gì</Eyebrow>
        <Typography component="h2" sx={{ fontWeight: 800, fontSize: 28, mt: 0.5, mb: 3 }}>Trải nghiệm thực tế từ khách hàng</Typography>
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {TESTIMONIALS.map((t) => (
            <Stack key={t.name} direction="row" spacing={2} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${AUTO.line}`, boxShadow: AUTO.shadow }}>
              <Box sx={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", bgcolor: AUTO.ink, color: "#fff", fontWeight: 700, fontSize: 20 }}>{t.name.split(" ").pop()?.charAt(0)}</Box>
              <Box>
                <Typography sx={{ fontSize: 12.5, lineHeight: 1.7, color: "#3A4150" }}>&ldquo;{t.text}&rdquo;</Typography>
                <Typography sx={{ mt: 1.25, fontWeight: 700, fontSize: 12.5 }}>{t.name}</Typography>
                <Rating value={5} readOnly size="small" sx={{ color: "#FFB020" }} />
              </Box>
            </Stack>
          ))}
        </Box>
      </Box>
    </CarsShell>
  );
}
