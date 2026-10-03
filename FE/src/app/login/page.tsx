"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { Alert, Box, Button, Container, Link, Paper, TextField, Typography } from "@mui/material";
import { useAuth } from "@/context/AuthContext";

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
      await login(email, password);
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
          Đăng nhập
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2, mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <TextField
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          <Typography variant="body2" align="center">
            Chưa có tài khoản?{" "}
            <Link component={NextLink} href="/register">
              Đăng ký
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
