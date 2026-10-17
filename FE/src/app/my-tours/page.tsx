"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Chip, CircularProgress, Stack, Tab, Tabs, Typography } from "@mui/material";
import EventIcon from "@mui/icons-material/EventOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import PageHero from "@/components/site/PageHero";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { HERO_IMAGES, SITE } from "@/components/site/tokens";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Booking, bookingApi } from "@/lib/api";
import { rememberNext } from "@/lib/loginRedirect";
import { BOOKING_STATUS, CASH_NOTE, PAYMENT_STATUS, formatDate, formatDateTime, formatVnd, todayIso } from "@/lib/tourFormat";

type Group = "all" | "upcoming" | "done" | "cancelled";

/** Nhóm của một đăng ký: sắp đi, đã đi (kể cả đã kết thúc nhưng chờ admin xác nhận) hoặc đã hủy. */
function groupOf(b: Booking, today: string): Exclude<Group, "all"> {
  if (b.status === "CANCELLED") return "cancelled";
  if (b.status === "COMPLETED" || (b.endDate && b.endDate < today)) return "done";
  return "upcoming";
}

function Stat({ value, label, tone }: { value: string | number; label: string; tone: string }) {
  return (
    <Box sx={{ px: 2.5, py: 1.75, borderRadius: 4, minWidth: 150, color: "#fff", bgcolor: "rgba(255,255,255,0.16)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.28)" }}>
      <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 28, lineHeight: 1.1, color: tone }}>{value}</Typography>
      <Typography sx={{ fontSize: 12, opacity: 0.9 }}>{label}</Typography>
    </Box>
  );
}

/** Lịch sử đăng ký tour của người dùng, hiển thị như những tấm vé. */
export default function MyToursPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<Group>("all");
  const today = todayIso();

  useEffect(() => {
    if (!loading && !user) {
      rememberNext("/my-tours");
      router.replace("/login");
    }
  }, [loading, user, router]);

  const { data = [], isPending, error } = useQuery({ queryKey: ["bookings", "mine"], queryFn: bookingApi.mine, enabled: !!user });

  const cancel = useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["tours"] });
      toast.success("Đã hủy đăng ký");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stats = useMemo(() => {
    const upcoming = data.filter((b) => groupOf(b, today) === "upcoming").length;
    const completed = data.filter((b) => b.status === "COMPLETED");
    return {
      upcoming,
      completed: completed.length,
      spent: completed.reduce((sum, b) => sum + b.totalAmount, 0),
      toReview: completed.filter((b) => !b.hasReview).length,
    };
  }, [data, today]);

  const list = useMemo(() => data.filter((b) => tab === "all" || groupOf(b, today) === tab), [data, tab, today]);
  const count = (g: Exclude<Group, "all">) => data.filter((b) => groupOf(b, today) === g).length;

  if (loading || !user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: SITE.brand }} />
      </Box>
    );
  }

  return (
    <SiteShell>
      <PageHero image={HERO_IMAGES.danang} eyebrow={`Xin chào, ${user.fullName}`} title="Hành trình của tôi" subtitle={CASH_NOTE} height={330}>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Stat value={stats.upcoming} label="Sắp khởi hành" tone="#FFD9B0" />
          <Stat value={stats.completed} label="Chuyến đã đi" tone="#B8F1DC" />
          <Stat value={formatVnd(stats.spent)} label="Đã thanh toán" tone="#FFE08A" />
          <Stat value={stats.toReview} label="Chờ đánh giá" tone="#FFB8A6" />
        </Stack>
      </PageHero>

      <SiteContainer sx={{ mt: -2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 700, textTransform: "none", fontSize: 14 }, "& .MuiTabs-indicator": { height: 3, borderRadius: 2, background: SITE.gradientCoral } }}>
          <Tab value="all" label={`Tất cả (${data.length})`} />
          <Tab value="upcoming" label={`Sắp đi (${count("upcoming")})`} />
          <Tab value="done" label={`Đã đi (${count("done")})`} />
          <Tab value="cancelled" label={`Đã hủy (${count("cancelled")})`} />
        </Tabs>

        {error && <Alert severity="error">{(error as Error).message}</Alert>}
        {isPending ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <CircularProgress sx={{ color: SITE.brand }} />
          </Box>
        ) : list.length === 0 ? (
          <Box sx={{ py: 9, textAlign: "center" }}>
            <Typography sx={{ fontFamily: SITE.serif, fontSize: 26, color: SITE.ink }}>{data.length === 0 ? "Bạn chưa đăng ký tour nào" : "Không có chuyến đi nào trong mục này"}</Typography>
            <Button component={NextLink} href="/tours" sx={{ mt: 2.5, px: 4, height: 46, borderRadius: 6, color: "#fff", background: SITE.gradientCoral, boxShadow: "0 10px 24px rgba(255,107,74,0.38)" }}>
              Khám phá tour
            </Button>
          </Box>
        ) : (
          <Stack spacing={3}>
            {list.map((b) => {
              const g = groupOf(b, today);
              const awaiting = b.status === "REGISTERED" && g === "done";
              return (
                <Box key={b.id} sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, borderRadius: 5, overflow: "hidden", bgcolor: "#fff", boxShadow: SITE.shadow, opacity: b.status === "CANCELLED" ? 0.72 : 1 }}>
                  <Box sx={{ position: "relative", width: { xs: "100%", md: 260 }, height: { xs: 170, md: "auto" }, minHeight: { md: 190 }, flexShrink: 0, background: SITE.gradientSky }}>
                    {b.tourImage && <Box component="img" src={b.tourImage} alt={b.tourName} loading="lazy" referrerPolicy="no-referrer" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: b.status === "CANCELLED" ? "grayscale(1)" : "none" }} />}
                    <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.25) 100%)" }} />
                    <Chip size="small" label={BOOKING_STATUS[b.status].label} color={BOOKING_STATUS[b.status].color} sx={{ position: "absolute", top: 12, left: 12, fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ flexGrow: 1, p: 2.75, minWidth: 0 }}>
                    <Typography component={NextLink} href={`/tours/${b.tourId}`} sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 20, lineHeight: 1.3, color: SITE.ink, textDecoration: "none", display: "block", "&:hover": { color: SITE.brand } }}>
                      {b.tourName}
                    </Typography>
                    <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap sx={{ mt: 1, color: SITE.muted }}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <EventIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: 13 }}>
                          {formatDate(b.startDate)} - {formatDate(b.endDate)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <GroupsIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: 13 }}>{b.participants} người</Typography>
                      </Stack>
                    </Stack>
                    <Typography sx={{ mt: 1.25, fontSize: 12, color: SITE.muted }}>
                      Đăng ký lúc {formatDateTime(b.createdAt)}
                      {b.paidAt ? ` · Đã thu tiền lúc ${formatDateTime(b.paidAt)}` : ""}
                    </Typography>
                    {awaiting && (
                      <Alert severity="info" sx={{ mt: 1.5, borderRadius: 3, py: 0 }}>
                        Chuyến đi đã kết thúc, đang chờ quản trị viên xác nhận thanh toán.
                      </Alert>
                    )}
                  </Box>

                  <Box sx={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 1.5, p: 2.75, minWidth: { md: 230 }, bgcolor: SITE.sand, borderLeft: { md: `2px dashed ${SITE.line}` }, borderTop: { xs: `2px dashed ${SITE.line}`, md: "none" } }}>
                    <Box>
                      <Typography sx={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: SITE.muted }}>Tổng tiền</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: 24, color: SITE.coral }}>{formatVnd(b.totalAmount)}</Typography>
                      {b.status !== "CANCELLED" && <Chip size="small" variant="outlined" color={PAYMENT_STATUS[b.paymentStatus].color} label={PAYMENT_STATUS[b.paymentStatus].label} sx={{ mt: 0.75, fontWeight: 600 }} />}
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {b.status === "REGISTERED" && g === "upcoming" && (
                        <Button size="small" color="error" variant="outlined" disabled={cancel.isPending} onClick={() => cancel.mutate(b.id)} sx={{ borderRadius: 5 }}>
                          Hủy đăng ký
                        </Button>
                      )}
                      {b.status === "COMPLETED" && (
                        <Button component={NextLink} href={`/tours/${b.tourId}#reviews`} size="small" sx={{ px: 2.5, borderRadius: 5, color: "#fff", background: b.hasReview ? SITE.gradientBrand : SITE.gradientCoral }}>
                          {b.hasReview ? "Sửa đánh giá" : "Đánh giá tour"}
                        </Button>
                      )}
                      <Button component={NextLink} href={`/tours/${b.tourId}`} size="small" sx={{ borderRadius: 5 }}>
                        Xem tour
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </SiteContainer>
    </SiteShell>
  );
}
