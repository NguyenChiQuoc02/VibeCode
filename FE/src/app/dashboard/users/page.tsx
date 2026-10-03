"use client";

import PageTitle from "@/components/PageTitle";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardHeader,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const { data: users = [], isPending, error } = useQuery({
    queryKey: ["users"],
    queryFn: authApi.listUsers,
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return <Alert severity="warning">Chỉ ADMIN mới xem được danh sách người dùng.</Alert>;
  }

  return (
    <>
      <PageTitle />
      <Card>
        <CardHeader title="Danh sách tài khoản" subheader={`${users.length} người dùng`} />
        {error && <Alert severity="error" sx={{ mx: 3, mb: 2 }}>{(error as Error).message}</Alert>}
        {isPending ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light" }}>{u.fullName.charAt(0).toUpperCase()}</Avatar>
                        {u.fullName}
                      </Box>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip size="small" label={u.role} color={u.role === "ADMIN" ? "error" : "success"} variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </>
  );
}
