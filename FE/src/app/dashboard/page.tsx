"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { authApi, User } from "@/lib/api";

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.role === "ADMIN" && token) {
      authApi.listUsers(token).then(setUsers).catch(() => setUsers([]));
    }
  }, [user, token]);

  if (loading || !user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            VibeCode
          </Typography>
          <Button
            color="inherit"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Xin chào, {user.fullName}{" "}
          <Chip label={user.role} color={user.role === "ADMIN" ? "error" : "primary"} size="small" />
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {user.email}
        </Typography>

        {user.role === "ADMIN" ? (
          <Paper sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ p: 2 }}>
              Danh sách người dùng (chỉ ADMIN)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : (
          <Typography sx={{ mt: 3 }}>Bạn đang đăng nhập với quyền USER.</Typography>
        )}
      </Container>
    </>
  );
}
