"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { Alert, Box, Button, Container, Link, Paper, TextField, Typography } from "@mui/material";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }
    setSubmitting(true);
    try {
      await register(fullName, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Đăng ký
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2, mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Họ tên" value={fullName} onChange={(e) => setFullName(e.target.value)} required fullWidth />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <TextField
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Tối thiểu 6 ký tự"
            required
            fullWidth
          />
          <TextField
            label="Nhập lại mật khẩu"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
          <Typography variant="body2" align="center">
            Đã có tài khoản?{" "}
            <Link component={NextLink} href="/login">
              Đăng nhập
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
