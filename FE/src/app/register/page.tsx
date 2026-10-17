"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { Alert, Box, Button, Link, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/PersonOutline";
import EmailIcon from "@mui/icons-material/MailOutline";
import LockIcon from "@mui/icons-material/LockOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";
import AuthField, { submitSx } from "@/components/auth/AuthField";
import AuthShell from "@/components/auth/AuthShell";
import { SITE } from "@/components/site/tokens";
import { useAuth } from "@/context/AuthContext";
import { afterLoginPath } from "@/lib/loginRedirect";

/** Độ mạnh mật khẩu 0-4: độ dài, chữ hoa/thường, số, ký tự đặc biệt. */
function strength(p: string): number {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return Math.max(s, 1);
}
const LEVELS = [
  { label: "", color: "#E3E8E6" },
  { label: "Yếu", color: "#FF5630" },
  { label: "Trung bình", color: "#FFAB00" },
  { label: "Khá", color: "#36B37E" },
  { label: "Mạnh", color: "#0E7C5B" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const level = strength(password);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }
    setSubmitting(true);
    try {
      const user = await register(fullName, email, password);
      router.push(afterLoginPath(user));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Tạo tài khoản" subtitle="Chỉ mất một phút để bắt đầu khám phá.">
      <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2.25 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
        <AuthField label="Họ tên" icon={<PersonIcon fontSize="small" />} value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
        <AuthField label="Email" type="email" icon={<EmailIcon fontSize="small" />} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Box>
          <AuthField label="Mật khẩu" type="password" icon={<LockIcon fontSize="small" />} value={password} onChange={(e) => setPassword(e.target.value)} helperText="Tối thiểu 6 ký tự" required autoComplete="new-password" />
          {password && (
            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.5 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Box key={i} sx={{ height: 4, borderRadius: 2, bgcolor: i <= level ? LEVELS[level].color : LEVELS[0].color, transition: "background .2s" }} />
                ))}
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: LEVELS[level].color, minWidth: 70, textAlign: "right" }}>{LEVELS[level].label}</Typography>
            </Box>
          )}
        </Box>
        <AuthField
          label="Nhập lại mật khẩu"
          type="password"
          icon={<LockResetIcon fontSize="small" />}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirm !== "" && confirm !== password}
          helperText={confirm !== "" && confirm !== password ? "Mật khẩu chưa khớp" : " "}
          required
          autoComplete="new-password"
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting} sx={submitSx}>
          {submitting ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
        <Typography variant="body2" align="center" sx={{ color: SITE.muted }}>
          Đã có tài khoản?{" "}
          <Link component={NextLink} href="/login" underline="hover" sx={{ fontWeight: 700, color: SITE.brand }}>
            Đăng nhập
          </Link>
        </Typography>
      </Box>
    </AuthShell>
  );
}
