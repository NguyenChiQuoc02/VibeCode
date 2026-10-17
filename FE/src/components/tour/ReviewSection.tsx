"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Avatar, Box, Button, Chip, LinearProgress, Rating, Stack, TextField, Typography } from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { SITE } from "@/components/site/tokens";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Tour, bookingApi, tourApi } from "@/lib/api";
import { formatDate } from "@/lib/tourFormat";

/** Đánh giá của tour: điểm tổng và phân bố sao, form cho người đã hoàn thành tour, danh sách nhận xét. */
export default function ReviewSection({ tour }: { tour: Tour }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();

  // Gửi kèm token (nếu có) để BE đánh dấu đánh giá của chính mình.
  const reviews = useQuery({ queryKey: ["tour", tour.id, "reviews", user?.id ?? "guest"], queryFn: () => tourApi.reviews(tour.id) });
  const mine = useQuery({ queryKey: ["bookings", "mine"], queryFn: bookingApi.mine, enabled: !!user });
  const completed = mine.data?.some((b) => b.tourId === tour.id && b.status === "COMPLETED") ?? false;
  const own = reviews.data?.find((r) => r.mine);

  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  // Có đánh giá cũ thì nạp vào form để sửa.
  useEffect(() => {
    if (own) {
      setRating(own.rating);
      setComment(own.comment);
    }
  }, [own]);

  const dist = useMemo(() => {
    const d = [0, 0, 0, 0, 0, 0];
    (reviews.data ?? []).forEach((r) => (d[r.rating] += 1));
    return d;
  }, [reviews.data]);

  const submit = useMutation({
    mutationFn: () => tourApi.review(tour.id, { rating: rating ?? 0, comment }),
    onSuccess: () => {
      setError("");
      qc.invalidateQueries({ queryKey: ["tour", tour.id] });
      qc.invalidateQueries({ queryKey: ["tours"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(own ? "Đã cập nhật đánh giá" : "Cảm ơn bạn đã đánh giá");
    },
    onError: (e: Error) => setError(e.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError("Vui lòng chọn số sao");
      return;
    }
    setError("");
    submit.mutate();
  };

  return (
    <Box id="reviews" sx={{ scrollMarginTop: 90 }}>
      <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 24, color: SITE.ink, mb: 2 }}>Khách nói gì về chuyến đi</Typography>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "200px 1fr" }, alignItems: "center", p: 3, mb: 2.5, borderRadius: 5, bgcolor: "#fff", boxShadow: SITE.shadow }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 56, lineHeight: 1, color: SITE.ink }}>{tour.reviewCount > 0 ? tour.avgRating.toFixed(1) : "–"}</Typography>
          <Rating value={tour.avgRating} precision={0.5} readOnly sx={{ mt: 0.5 }} />
          <Typography sx={{ fontSize: 12, color: SITE.muted, mt: 0.5 }}>{tour.reviewCount} đánh giá</Typography>
        </Box>
        <Stack spacing={0.75}>
          {[5, 4, 3, 2, 1].map((s) => (
            <Stack key={s} direction="row" spacing={1.5} alignItems="center">
              <Typography sx={{ width: 40, fontSize: 12, color: SITE.muted }}>{s} sao</Typography>
              <LinearProgress variant="determinate" value={tour.reviewCount ? (dist[s] / tour.reviewCount) * 100 : 0} sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: "rgba(255,176,32,0.18)", "& .MuiLinearProgress-bar": { bgcolor: SITE.sun, borderRadius: 4 } }} />
              <Typography sx={{ width: 24, fontSize: 12, color: SITE.muted, textAlign: "right" }}>{dist[s]}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {user && completed && (
        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 1.5, p: 3, mb: 2.5, borderRadius: 5, background: `linear-gradient(135deg, ${SITE.sand} 0%, #fff 100%)`, border: `1px solid ${SITE.line}` }}>
          <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 18 }}>{own ? "Chỉnh sửa đánh giá của bạn" : "Chia sẻ trải nghiệm của bạn"}</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Rating value={rating} onChange={(_, v) => setRating(v)} size="large" />
          <TextField label="Nhận xét" value={comment} onChange={(e) => setComment(e.target.value)} multiline minRows={3} fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#fff" } }} />
          <Box>
            <Button type="submit" disabled={submit.isPending} sx={{ px: 4, height: 44, borderRadius: 6, color: "#fff", background: SITE.gradientCoral, boxShadow: "0 8px 20px rgba(255,107,74,0.35)", "&:hover": { filter: "brightness(1.06)" } }}>
              {own ? "Cập nhật đánh giá" : "Gửi đánh giá"}
            </Button>
          </Box>
        </Box>
      )}
      {user && !completed && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 3 }}>
          Bạn có thể đánh giá sau khi hoàn thành tour này.
        </Alert>
      )}

      {reviews.data && reviews.data.length === 0 && <Typography color="text.secondary">Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận!</Typography>}
      <Stack spacing={2}>
        {reviews.data?.map((r) => (
          <Box key={r.id} sx={{ position: "relative", p: 2.5, borderRadius: 4, bgcolor: "#fff", boxShadow: "0 4px 16px rgba(11,61,53,0.07)" }}>
            <FormatQuoteIcon sx={{ position: "absolute", right: 14, top: 10, fontSize: 44, color: "rgba(14,124,91,0.1)" }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 40, height: 40, bgcolor: SITE.brand, fontWeight: 700 }}>{r.authorName.charAt(0).toUpperCase()}</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{r.authorName}</Typography>
                  {r.mine && <Chip size="small" label="Của bạn" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: "rgba(14,124,91,0.12)", color: SITE.brand }} />}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(r.createdAt)}
                </Typography>
              </Box>
              <Rating value={r.rating} readOnly size="small" />
            </Stack>
            {r.comment && (
              <Typography sx={{ mt: 1.5, fontSize: 14, lineHeight: 1.75, color: SITE.ink, whiteSpace: "pre-wrap" }}>{r.comment}</Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
