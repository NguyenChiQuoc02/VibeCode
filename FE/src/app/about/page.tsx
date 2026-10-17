"use client";

import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import PublicIcon from "@mui/icons-material/Public";
import EmojiNatureIcon from "@mui/icons-material/EmojiNatureOutlined";
import PageHero from "@/components/site/PageHero";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { HERO_IMAGES, SITE } from "@/components/site/tokens";
import { overviewApi } from "@/lib/api";

const STEPS = [
  { icon: <ExploreOutlinedIcon />, title: "Khám phá", text: "Duyệt di tích, danh lam thắng cảnh và địa điểm du lịch để tìm nơi bạn muốn đến." },
  { icon: <LuggageOutlinedIcon />, title: "Chọn tour", text: "Xem lịch trình, các điểm tham quan và đánh giá, rồi đăng ký giữ chỗ chỉ vài thao tác." },
  { icon: <PaymentsOutlinedIcon />, title: "Đi và thanh toán", text: "Không cần trả trước. Bạn thanh toán bằng tiền mặt sau khi kết thúc hành trình." },
  { icon: <StarBorderIcon />, title: "Chia sẻ", text: "Viết đánh giá để giúp những du khách khác chọn được chuyến đi phù hợp." },
];

const VALUES = [
  { icon: <VerifiedUserOutlinedIcon />, title: "Minh bạch", text: "Thông tin tour, giá và lịch trình rõ ràng. Đánh giá của khách là công khai." },
  { icon: <PublicIcon />, title: "Phủ khắp đất nước", text: "Dữ liệu di tích và điểm đến trải dài từ Bắc vào Nam, gắn với bản đồ hành chính." },
  { icon: <EmojiNatureIcon />, title: "Có trách nhiệm", text: "Khuyến khích du lịch bền vững, tôn trọng di sản và cộng đồng địa phương." },
];

const FAQ = [
  ["Tôi có phải trả tiền khi đăng ký tour không?", "Không. Bạn chỉ giữ chỗ khi đăng ký. Tiền tour được thanh toán bằng tiền mặt sau khi kết thúc hành trình."],
  ["Tôi có thể hủy đăng ký không?", "Có. Bạn có thể hủy đăng ký trong mục Tour của tôi, miễn là tour chưa khởi hành."],
  ["Khi nào tôi có thể đánh giá tour?", "Sau khi hoàn thành chuyến đi và được quản trị viên xác nhận, bạn có thể viết hoặc chỉnh sửa đánh giá trên trang chi tiết tour."],
  ["Tôi cần đăng nhập để làm gì?", "Bạn có thể xem toàn bộ nội dung mà không cần đăng nhập. Đăng nhập chỉ cần khi bạn muốn đăng ký tour, lưu yêu thích hoặc viết đánh giá."],
];

function Counter({ value, label }: { value?: number; label: string }) {
  return (
    <Box sx={{ textAlign: "center", color: "#fff" }}>
      <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: { xs: 34, md: 46 }, lineHeight: 1.1 }}>{value === undefined ? "–" : value.toLocaleString("vi-VN")}</Typography>
      <Typography sx={{ mt: 0.5, fontSize: 13, opacity: 0.85 }}>{label}</Typography>
    </Box>
  );
}

/** Giới thiệu VietJourney: công khai. Số liệu lấy từ hệ thống. */
export default function AboutPage() {
  const { data } = useQuery({ queryKey: ["overview"], queryFn: overviewApi.get, staleTime: 5 * 60_000 });
  return (
    <SiteShell>
      <PageHero image={HERO_IMAGES.halong} eyebrow="Câu chuyện của chúng tôi" title="Về VietJourney" subtitle="Chúng tôi giúp bạn khám phá di sản, cảnh sắc Việt Nam và đặt những chuyến đi trọn vẹn một cách dễ dàng." height={380} />

      <SiteContainer sx={{ mt: -2 }}>
        <Box sx={{ display: "grid", gap: 5, gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" }, alignItems: "center" }}>
          <Box>
            <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: { xs: 28, md: 36 }, lineHeight: 1.2, color: SITE.ink }}>Mỗi hành trình là một câu chuyện đáng kể</Typography>
            <Typography sx={{ mt: 2, fontSize: 16.5, lineHeight: 1.9, color: SITE.ink }}>
              VietJourney bắt đầu từ một ý tưởng đơn giản: gom những thông tin đáng tin cậy về di tích, danh lam thắng cảnh và điểm đến vào một nơi, rồi giúp du khách biến chúng thành chuyến đi cụ thể.
            </Typography>
            <Typography sx={{ mt: 2, fontSize: 16.5, lineHeight: 1.9, color: SITE.ink }}>
              Từ bản đồ hành chính, thư viện địa danh đến các tour có lịch trình rõ ràng và đánh giá thật từ khách đã đi, mọi thứ đều hướng tới việc để bạn yên tâm chọn đúng nơi, đúng thời điểm.
            </Typography>
          </Box>
          <Box sx={{ position: "relative", height: { xs: 260, md: 340 }, borderRadius: 6, overflow: "hidden", boxShadow: SITE.shadowHover, backgroundImage: `url("${HERO_IMAGES.danang}")`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <Box sx={{ position: "absolute", left: 16, bottom: 16, px: 2, py: 1, borderRadius: 4, bgcolor: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}>
              <Typography sx={{ fontFamily: SITE.serif, fontStyle: "italic", color: SITE.brandDark }}>Việt Nam đang chờ bạn.</Typography>
            </Box>
          </Box>
        </Box>
      </SiteContainer>

      <Box sx={{ mt: 8, py: 6, px: 2, background: `linear-gradient(135deg, ${SITE.brandDark} 0%, ${SITE.brand} 100%)` }}>
        <Box sx={{ maxWidth: 1100, mx: "auto", display: "grid", gap: 3, gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" } }}>
          <Counter value={data?.landmarks} label="Di tích, danh thắng" />
          <Counter value={data?.destinations} label="Địa điểm du lịch" />
          <Counter value={data?.provinces} label="Tỉnh, thành phố" />
          <Counter value={data?.tours} label="Tour du lịch" />
          <Counter value={data?.reviews} label="Đánh giá từ khách" />
        </Box>
      </Box>

      <SiteContainer sx={{ mt: 8 }}>
        <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 30, color: SITE.ink, textAlign: "center" }}>Đặt tour dễ dàng trong bốn bước</Typography>
        <Box sx={{ mt: 4, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" } }}>
          {STEPS.map((s, i) => (
            <Box key={s.title} sx={{ position: "relative", p: 3, borderRadius: 5, bgcolor: "#fff", boxShadow: SITE.shadow }}>
              <Typography sx={{ position: "absolute", right: 18, top: 8, fontFamily: SITE.serif, fontWeight: 700, fontSize: 54, color: "rgba(14,124,91,0.1)" }}>{i + 1}</Typography>
              <Box sx={{ width: 52, height: 52, borderRadius: 3, display: "grid", placeItems: "center", color: "#fff", background: SITE.gradientBrand, "& svg": { fontSize: 26 } }}>{s.icon}</Box>
              <Typography sx={{ mt: 2, fontFamily: SITE.serif, fontWeight: 700, fontSize: 20, color: SITE.ink }}>{s.title}</Typography>
              <Typography sx={{ mt: 0.75, fontSize: 14, lineHeight: 1.7, color: SITE.muted }}>{s.text}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 8, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {VALUES.map((v) => (
            <Stack key={v.title} direction="row" spacing={2} sx={{ p: 3, borderRadius: 5, background: `linear-gradient(135deg, ${SITE.sand} 0%, #fff 100%)`, border: `1px solid ${SITE.line}` }}>
              <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", color: "#fff", background: SITE.gradientCoral, "& svg": { fontSize: 24 } }}>{v.icon}</Box>
              <Box>
                <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 19, color: SITE.ink }}>{v.title}</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 14, lineHeight: 1.7, color: SITE.muted }}>{v.text}</Typography>
              </Box>
            </Stack>
          ))}
        </Box>

        <Box sx={{ mt: 8, maxWidth: 820, mx: "auto" }}>
          <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 30, color: SITE.ink, textAlign: "center", mb: 3 }}>Câu hỏi thường gặp</Typography>
          {FAQ.map(([q, a]) => (
            <Accordion key={q} disableGutters elevation={0} sx={{ mb: 1.5, borderRadius: "16px !important", boxShadow: "0 4px 16px rgba(11,61,53,0.07)", "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, "& .MuiTypography-root": { fontWeight: 700, color: SITE.ink } }}>
                <Typography>{q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
                <Typography sx={{ fontSize: 14.5, lineHeight: 1.8, color: SITE.muted }}>{a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box sx={{ mt: 8, p: { xs: 4, md: 6 }, borderRadius: 6, textAlign: "center", color: "#fff", background: SITE.gradientCoral, boxShadow: "0 24px 50px rgba(255,107,74,0.35)" }}>
          <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: { xs: 26, md: 34 } }}>Sẵn sàng cho chuyến đi tiếp theo?</Typography>
          <Typography sx={{ mt: 1, opacity: 0.95 }}>Chọn một hành trình và giữ chỗ ngay, không cần trả trước.</Typography>
          <Button component={NextLink} href="/tours" sx={{ mt: 3, px: 5, height: 50, borderRadius: 6, fontSize: 15, color: SITE.coral, bgcolor: "#fff", "&:hover": { bgcolor: "#FFF4EE" } }}>
            Xem các tour
          </Button>
        </Box>
      </SiteContainer>
    </SiteShell>
  );
}
