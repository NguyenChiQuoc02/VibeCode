"use client";

import { FormEvent, useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import SiteShell, { SiteContainer } from "@/components/site/SiteShell";
import { SITE } from "@/components/site/tokens";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authApi, bookingApi, favoriteApi } from "@/lib/api";
import { rememberNext } from "@/lib/loginRedirect";

const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#fff" } };
const saveBtn = { px: 4, height: 46, borderRadius: 6, color: "#fff", background: SITE.gradientBrand, boxShadow: "0 10px 22px rgba(14,124,91,0.3)", "&:hover": { filter: "brightness(1.08)" }, "&.Mui-disabled": { opacity: 0.5, color: "#fff" } };

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 5, bgcolor: "#fff", boxShadow: SITE.shadow }}>
      <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 22, color: SITE.ink }}>{title}</Typography>
      {hint && <Typography sx={{ fontSize: 13, color: SITE.muted, mt: 0.5 }}>{hint}</Typography>}
      <Box sx={{ mt: 2.5 }}>{children}</Box>
    </Box>
  );
}

/** Hồ sơ cá nhân: ảnh bìa và thống kê, sửa họ tên, số điện thoại, đổi mật khẩu. Email không đổi được. */
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      rememberNext("/profile");
      router.replace("/login");
    }
  }, [loading, user, router]);

  const bookings = useQuery({ queryKey: ["bookings", "mine"], queryFn: bookingApi.mine, enabled: !!user });
  const favorites = useQuery({ queryKey: ["favorites", "list"], queryFn: favoriteApi.list, enabled: !!user });

  if (loading || !user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: SITE.brand }} />
      </Box>
    );
  }

  const done = (bookings.data ?? []).filter((b) => b.status === "COMPLETED");
  const stats = [
    { icon: <LuggageOutlinedIcon />, value: (bookings.data ?? []).filter((b) => b.status !== "CANCELLED").length, label: "Tour đã đăng ký", href: "/my-tours" },
    { icon: <VerifiedOutlinedIcon />, value: done.length, label: "Chuyến đã đi", href: "/my-tours" },
    { icon: <StarBorderIcon />, value: done.filter((b) => b.hasReview).length, label: "Đánh giá đã viết", href: "/my-tours" },
    { icon: <FavoriteBorderIcon />, value: favorites.data?.length ?? 0, label: "Mục yêu thích", href: "/favorites" },
  ];

  return (
    <SiteShell>
      <Box sx={{ position: "relative", height: { xs: 190, md: 230 }, pt: 8, background: "linear-gradient(120deg, #0B3D35 0%, #0E7C5B 45%, #14B8A6 100%)", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", right: -60, top: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <Box sx={{ position: "absolute", right: 140, bottom: -120, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,107,74,0.22)" }} />
      </Box>

      <SiteContainer sx={{ mt: { xs: -9, md: -10 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ sm: "flex-start" }} sx={{ mb: 4 }}>
          <Avatar sx={{ width: 120, height: 120, fontSize: 52, fontWeight: 700, fontFamily: SITE.serif, color: "#fff", background: SITE.gradientCoral, border: "5px solid #fff", boxShadow: SITE.shadow }}>{user.fullName.charAt(0).toUpperCase()}</Avatar>
          {/* Cách ảnh bìa một đoạn để tên không đè lên nền xanh đậm */}
          <Box sx={{ pt: { sm: "84px" } }}>
            <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: { xs: 28, md: 36 }, lineHeight: 1.15, color: SITE.ink }}>{user.fullName}</Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
              <Typography sx={{ color: SITE.muted }}>{user.email}</Typography>
              <Chip size="small" label={user.role === "ADMIN" ? "Quản trị viên" : "Thành viên"} sx={{ fontWeight: 700, bgcolor: "rgba(14,124,91,0.12)", color: SITE.brand }} />
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, mb: 4 }}>
          {stats.map((s) => (
            <Box key={s.label} component={NextLink} href={s.href} sx={{ display: "flex", alignItems: "center", gap: 1.75, p: 2.25, borderRadius: 4, bgcolor: "#fff", boxShadow: "0 4px 16px rgba(11,61,53,0.08)", textDecoration: "none", transition: "transform .2s, box-shadow .2s", "&:hover": { transform: "translateY(-3px)", boxShadow: SITE.shadow } }}>
              <Box sx={{ width: 46, height: 46, borderRadius: 3, display: "grid", placeItems: "center", color: SITE.brand, bgcolor: "rgba(14,124,91,0.1)" }}>{s.icon}</Box>
              <Box>
                <Typography sx={{ fontFamily: SITE.serif, fontWeight: 700, fontSize: 26, lineHeight: 1.1, color: SITE.ink }}>{s.value}</Typography>
                <Typography sx={{ fontSize: 12, color: SITE.muted }}>{s.label}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, alignItems: "start" }}>
          <InfoPanel />
          <PasswordPanel />
        </Box>
      </SiteContainer>
    </SiteShell>
  );
}

function InfoPanel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: () => authApi.updateProfile(fullName.trim(), phone.trim()),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setFullName(u.fullName);
      setPhone(u.phone ?? "");
      setError("");
      toast.success("Đã cập nhật thông tin cá nhân");
    },
    onError: (e: Error) => setError(e.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  return (
    <Panel title="Thông tin cá nhân" hint="Họ tên và số điện thoại sẽ được điền sẵn khi bạn đăng ký tour.">
      <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" value={user?.email ?? ""} disabled helperText="Email dùng để đăng nhập nên không thể thay đổi" fullWidth sx={fieldSx} />
        <TextField label="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} required fullWidth sx={fieldSx} />
        <TextField label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth sx={fieldSx} />
        <Box>
          <Button type="submit" disabled={save.isPending || !fullName.trim()} sx={saveBtn}>
            {save.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Box>
      </Box>
    </Panel>
  );
}

function PasswordPanel() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const change = useMutation({
    mutationFn: () => authApi.changePassword(current, next),
    onSuccess: () => {
      setCurrent("");
      setNext("");
      setConfirm("");
      setError("");
      toast.success("Đã đổi mật khẩu");
    },
    onError: (e: Error) => setError(e.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    change.mutate();
  };

  return (
    <Panel title="Đổi mật khẩu" hint="Chọn mật khẩu mới có ít nhất 6 ký tự.">
      <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Mật khẩu hiện tại" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required fullWidth autoComplete="current-password" sx={fieldSx} />
        <TextField label="Mật khẩu mới" type="password" value={next} onChange={(e) => setNext(e.target.value)} required fullWidth autoComplete="new-password" sx={fieldSx} />
        <TextField label="Nhập lại mật khẩu mới" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required fullWidth autoComplete="new-password" sx={fieldSx} />
        <Box>
          <Button type="submit" disabled={change.isPending} sx={saveBtn}>
            {change.isPending ? "Đang đổi..." : "Đổi mật khẩu"}
          </Button>
        </Box>
      </Box>
    </Panel>
  );
}
