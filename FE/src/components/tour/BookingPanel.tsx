"use client";

import { FormEvent, useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Chip, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { SITE } from "@/components/site/tokens";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Tour, bookingApi, tourApi } from "@/lib/api";
import { rememberNext } from "@/lib/loginRedirect";
import { BOOKING_STATUS, CASH_NOTE, PAYMENT_STATUS, formatVnd, tourAvailability } from "@/lib/tourFormat";

const coralBtn = { height: 52, borderRadius: 6, fontSize: 16, color: "#fff", background: SITE.gradientCoral, boxShadow: "0 12px 26px rgba(255,107,74,0.4)", "&:hover": { filter: "brightness(1.06)" }, "&.Mui-disabled": { opacity: 0.55, color: "#fff" } };
const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#fff" } };

/** Khung đặt tour ở trang chi tiết: form đăng ký, hoặc trạng thái đăng ký hiện có của người dùng. */
export default function BookingPanel({ tour }: { tour: Tour }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const toast = useToast();
  const avail = tourAvailability(tour);

  const mine = useQuery({ queryKey: ["bookings", "mine"], queryFn: bookingApi.mine, enabled: !!user });
  const active = mine.data?.find((b) => b.tourId === tour.id && b.status !== "CANCELLED");

  const [contactName, setContactName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [participants, setParticipants] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // Thông tin người dùng tải xong sau lần render đầu, điền sẵn vào form nếu còn trống.
  useEffect(() => {
    if (user) {
      setContactName((v) => v || user.fullName);
      setPhone((v) => v || user.phone || "");
    }
  }, [user]);

  const left = tour.maxParticipants - tour.bookedSeats;
  const filled = Math.min(100, Math.round((tour.bookedSeats / tour.maxParticipants) * 100));
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["bookings"] });
    qc.invalidateQueries({ queryKey: ["tours"] });
    qc.invalidateQueries({ queryKey: ["tour", tour.id] });
  };

  const book = useMutation({
    mutationFn: () => tourApi.book(tour.id, { contactName: contactName.trim(), phone: phone.trim(), participants, note: note.trim() }),
    onSuccess: () => {
      setError("");
      refresh();
      toast.success("Đăng ký tour thành công");
    },
    onError: (e: Error) => setError(e.message),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    onSuccess: () => {
      refresh();
      toast.success("Đã hủy đăng ký");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    book.mutate();
  };

  const login = () => {
    rememberNext(pathname);
    router.push("/login");
  };

  return (
    <Box sx={{ position: { md: "sticky" }, top: { md: 88 }, borderRadius: 6, overflow: "hidden", bgcolor: "#fff", boxShadow: "0 24px 56px rgba(11,61,53,0.22)" }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 2, background: `linear-gradient(135deg, ${SITE.sand} 0%, #FFFFFF 100%)` }}>
        <Typography sx={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: SITE.muted }}>Giá mỗi người</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: 32, lineHeight: 1.15, color: SITE.coral }}>{formatVnd(tour.price)}</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
          <Chip size="small" label={avail.label} sx={{ fontWeight: 700, bgcolor: avail.open ? "rgba(14,124,91,0.12)" : "rgba(28,37,46,0.1)", color: avail.open ? SITE.brand : SITE.muted }} />
          <Typography sx={{ fontSize: 12, color: SITE.muted }}>
            {tour.bookedSeats}/{tour.maxParticipants} chỗ đã đặt
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={filled} sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: "rgba(14,124,91,0.12)", "& .MuiLinearProgress-bar": { background: filled > 80 ? SITE.gradientCoral : SITE.gradientBrand, borderRadius: 3 } }} />
      </Box>

      <Box sx={{ p: 3 }}>
        {active ? (
          <Stack spacing={1.75}>
            <Alert severity="success" sx={{ borderRadius: 3 }}>
              Bạn đã đăng ký tour này.
            </Alert>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" color={BOOKING_STATUS[active.status].color} label={BOOKING_STATUS[active.status].label} />
              <Chip size="small" variant="outlined" color={PAYMENT_STATUS[active.paymentStatus].color} label={PAYMENT_STATUS[active.paymentStatus].label} />
            </Stack>
            <Typography variant="body2">
              {active.participants} người · Tổng tiền <b>{formatVnd(active.totalAmount)}</b>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {CASH_NOTE}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button component={NextLink} href="/my-tours" variant="outlined" sx={{ borderRadius: 5, flexGrow: 1 }}>
                Tour của tôi
              </Button>
              {active.status === "REGISTERED" && (
                <Button color="error" disabled={cancel.isPending} onClick={() => cancel.mutate(active.id)} sx={{ borderRadius: 5 }}>
                  Hủy đăng ký
                </Button>
              )}
            </Stack>
          </Stack>
        ) : !user ? (
          <Stack spacing={1.75}>
            <Typography variant="body2" color="text.secondary">
              Đăng nhập để giữ chỗ cho chuyến đi này.
            </Typography>
            <Button onClick={login} disabled={!avail.open} sx={coralBtn}>
              Đăng nhập để đăng ký
            </Button>
          </Stack>
        ) : !avail.open ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            {avail.label}, hiện không nhận đăng ký.
          </Alert>
        ) : (
          <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 1.75 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
            <TextField size="small" label="Họ tên người liên hệ" value={contactName} onChange={(e) => setContactName(e.target.value)} required fullWidth sx={fieldSx} />
            <TextField size="small" label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required fullWidth sx={fieldSx} />
            <TextField
              size="small"
              label="Số người"
              type="number"
              value={participants}
              onChange={(e) => setParticipants(Math.max(1, Math.min(left, Number(e.target.value) || 1)))}
              inputProps={{ min: 1, max: left }}
              helperText={`Còn ${left} chỗ`}
              fullWidth
              sx={fieldSx}
            />
            <TextField size="small" label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} multiline minRows={2} fullWidth sx={fieldSx} />
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Tạm tính</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 22, color: SITE.ink }}>{formatVnd(tour.price * participants)}</Typography>
            </Stack>
            <Button type="submit" disabled={book.isPending} sx={coralBtn}>
              {book.isPending ? "Đang đăng ký..." : "Đăng ký tour"}
            </Button>
          </Box>
        )}

        <Stack spacing={1.25} sx={{ mt: 2.5, pt: 2, borderTop: `1px dashed ${SITE.line}` }}>
          {[
            [PaymentsOutlinedIcon, "Không cần trả trước", CASH_NOTE],
            [VerifiedUserOutlinedIcon, "Hủy miễn phí", "Hủy đăng ký bất cứ lúc nào trước ngày khởi hành."],
            [SupportAgentIcon, "Hỗ trợ 24/7", "Luôn có người đồng hành cùng bạn."],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof PaymentsOutlinedIcon;
            return (
              <Stack key={title as string} direction="row" spacing={1.25} alignItems="flex-start">
                <I sx={{ fontSize: 20, color: SITE.brand, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: SITE.ink }}>{title as string}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: SITE.muted, lineHeight: 1.5 }}>{text as string}</Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}
