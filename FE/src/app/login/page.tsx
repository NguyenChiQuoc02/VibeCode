"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { Alert, Box, Button, Link, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/MailOutline";
import LockIcon from "@mui/icons-material/LockOutlined";
import AuthField, { submitSx } from "@/components/auth/AuthField";
import AuthShell from "@/components/auth/AuthShell";
import { SITE } from "@/components/site/tokens";
import { useAuth } from "@/context/AuthContext";
import { afterLoginPath } from "@/lib/loginRedirect";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(afterLoginPath(user));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Chào mừng trở lại" subtitle="Đăng nhập để tiếp tục hành trình của bạn.">
      <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2.25 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
        <AuthField label="Email" type="email" icon={<EmailIcon fontSize="small" />} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <AuthField label="Mật khẩu" type="password" icon={<LockIcon fontSize="small" />} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        <Button type="submit" variant="contained" size="large" disabled={submitting} sx={submitSx}>
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
        <Typography variant="body2" align="center" sx={{ color: SITE.muted }}>
          Chưa có tài khoản?{" "}
          <Link component={NextLink} href="/register" underline="hover" sx={{ fontWeight: 700, color: SITE.brand }}>
            Đăng ký ngay
          </Link>
        </Typography>
      </Box>
    </AuthShell>
  );
}
