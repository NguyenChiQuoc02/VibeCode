"use client";

import PageTitle from "@/components/PageTitle";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import LockResetIcon from "@mui/icons-material/LockReset";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authApi, User } from "@/lib/api";

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const toast = useToast();
  const [target, setTarget] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState("");

  const reset = useMutation({
    mutationFn: (id: string) => authApi.resetUserPassword(id),
    onSuccess: (res) => {
      setTempPassword(res.temporaryPassword);
      setTarget((t) => t);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setTarget(null);
    },
  });
  const closeDialog = () => {
    setTarget(null);
    setTempPassword("");
    reset.reset();
  };

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
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
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
                    <TableCell>{u.phone || "–"}</TableCell>
                    <TableCell>
                      <Chip size="small" label={u.role} color={u.role === "ADMIN" ? "error" : "success"} variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Đặt lại mật khẩu">
                        <IconButton size="small" color="warning" onClick={() => setTarget(u)}>
                          <LockResetIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>

      <Dialog open={target !== null} onClose={closeDialog}>
        <DialogTitle>{tempPassword ? "Mật khẩu tạm" : "Đặt lại mật khẩu?"}</DialogTitle>
        <DialogContent>
          {tempPassword ? (
            <>
              <DialogContentText>Hãy chuyển mật khẩu này cho {target?.fullName}. Mật khẩu chỉ hiện một lần và người dùng nên đổi lại ngay sau khi đăng nhập.</DialogContentText>
              <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, bgcolor: "rgba(145,158,171,0.12)", fontFamily: "monospace", fontSize: 20, letterSpacing: 1, textAlign: "center", userSelect: "all" }}>{tempPassword}</Box>
            </>
          ) : (
            <DialogContentText>Mật khẩu hiện tại của {target?.fullName} ({target?.email}) sẽ bị thay bằng một mật khẩu tạm ngẫu nhiên.</DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {tempPassword ? (
            <>
              <Button onClick={() => navigator.clipboard.writeText(tempPassword).then(() => toast.success("Đã sao chép mật khẩu"))}>Sao chép</Button>
              <Button variant="contained" onClick={closeDialog}>Đóng</Button>
            </>
          ) : (
            <>
              <Button onClick={closeDialog}>Hủy</Button>
              <Button color="warning" variant="contained" disabled={reset.isPending} onClick={() => target && reset.mutate(target.id)}>
                Đặt lại
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
