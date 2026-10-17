"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Booking, bookingApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { BOOKING_STATUS, PAYMENT_STATUS, formatDate, formatDateTime, formatVnd, todayIso } from "@/lib/tourFormat";

/** Bảng đăng ký tour cho admin; có thể giới hạn theo một tour. Xác nhận hoàn thành chuyến đi và thu tiền mặt. */
export default function BookingsTable({ tourId }: { tourId?: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [confirming, setConfirming] = useState<Booking | null>(null);

  const { data = [], isPending, error } = useQuery({
    queryKey: ["bookings", "admin", tourId ?? "all", status],
    queryFn: () => bookingApi.list({ tourId, status: status || undefined }),
  });

  const complete = useMutation({
    mutationFn: (id: string) => bookingApi.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["tours"] });
      toast.success("Đã xác nhận hoàn thành và thu tiền mặt");
      setConfirming(null);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setConfirming(null);
    },
  });

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, pb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {data.length} đăng ký
        </Typography>
        <TextField select size="small" label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 170 }}>
          <MenuItem value="">Tất cả</MenuItem>
          {Object.entries(BOOKING_STATUS).map(([v, s]) => (
            <MenuItem key={v} value={v}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

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
                {!tourId && <TableCell>Tour</TableCell>}
                <TableCell>Người đăng ký</TableCell>
                <TableCell>Liên hệ</TableCell>
                <TableCell align="right">Số người</TableCell>
                <TableCell align="right">Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thanh toán</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((b) => {
                const ended = b.endDate !== undefined && b.endDate <= todayIso();
                return (
                  <TableRow key={b.id} hover>
                    {!tourId && (
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>{b.tourName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(b.startDate)} - {formatDate(b.endDate)}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{b.contactName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {b.userEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {b.phone}
                      {b.note && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {b.note}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{b.participants}</TableCell>
                    <TableCell align="right">{formatVnd(b.totalAmount)}</TableCell>
                    <TableCell>
                      <Chip size="small" color={BOOKING_STATUS[b.status].color} label={BOOKING_STATUS[b.status].label} />
                    </TableCell>
                    <TableCell>
                      {b.status !== "CANCELLED" ? <Chip size="small" variant="outlined" color={PAYMENT_STATUS[b.paymentStatus].color} label={PAYMENT_STATUS[b.paymentStatus].label} /> : "–"}
                      {b.paidAt && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatDateTime(b.paidAt)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      {b.status === "REGISTERED" ? (
                        <Tooltip title={ended ? "Xác nhận khách đã đi xong và đã thu tiền mặt" : "Chỉ xác nhận được sau khi tour kết thúc"}>
                          <span>
                            <Button size="small" variant="contained" disabled={!ended} onClick={() => setConfirming(b)}>
                              Hoàn thành & thu tiền
                            </Button>
                          </span>
                        </Tooltip>
                      ) : (
                        "–"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={tourId ? 7 : 8} align="center" sx={{ py: 5, color: "text.secondary" }}>
                    Chưa có đăng ký nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={confirming !== null} onClose={() => setConfirming(null)}>
        <DialogTitle>Xác nhận hoàn thành và thu tiền mặt?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirming?.contactName} đã hoàn thành tour &quot;{confirming?.tourName}&quot; và đã thanh toán <b>{confirming ? formatVnd(confirming.totalAmount) : ""}</b> bằng tiền mặt. Sau khi xác nhận, người dùng có thể đánh giá tour.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setConfirming(null)}>Hủy</Button>
          <Button variant="contained" disabled={complete.isPending} onClick={() => confirming && complete.mutate(confirming.id)}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
