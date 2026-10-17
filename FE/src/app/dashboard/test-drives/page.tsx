"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Card, CardHeader, Chip, CircularProgress, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import PageTitle from "@/components/PageTitle";
import { TestDriveStatus, testDriveApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { TEST_DRIVE_STATUS } from "@/lib/carFormat";
import { formatDate, formatDateTime } from "@/lib/tourFormat";

/** Lịch lái thử của khách (admin): xác nhận, đánh dấu đã lái thử hoặc hủy. */
export default function TestDrivesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState("");
  const { data = [], isPending, error } = useQuery({ queryKey: ["test-drives", "admin", status], queryFn: () => testDriveApi.list(status || undefined) });

  const change = useMutation({
    mutationFn: ({ id, to }: { id: string; to: TestDriveStatus }) => testDriveApi.setStatus(id, to),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["test-drives"] });
      toast.success("Đã cập nhật trạng thái");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const act = (id: string, to: TestDriveStatus, label: string, variant: "contained" | "outlined" = "outlined", color: "primary" | "error" = "primary") => (
    <Button size="small" variant={variant} color={color} disabled={change.isPending} onClick={() => change.mutate({ id, to })}>
      {label}
    </Button>
  );

  return (
    <>
      <PageTitle />
      <Card>
        <CardHeader
          title="Danh sách lịch lái thử"
          titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
          subheader={`${data.length} lịch hẹn`}
          action={
            <TextField select size="small" label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 170 }}>
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(TEST_DRIVE_STATUS).map(([v, s]) => (
                <MenuItem key={v} value={v}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          }
        />
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
                  <TableCell>Xe</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Liên hệ</TableCell>
                  <TableCell>Ngày hẹn</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ maxWidth: 240, fontWeight: 600 }}>{t.carName}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{t.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.userEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {t.phone}
                      {t.note && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {t.note}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(t.preferredDate)}
                      <Typography variant="caption" color="text.secondary" display="block">
                        Đặt lúc {formatDateTime(t.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" color={TEST_DRIVE_STATUS[t.status].color} label={TEST_DRIVE_STATUS[t.status].label} />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {t.status === "PENDING" && act(t.id, "CONFIRMED", "Xác nhận", "contained")}
                        {t.status === "CONFIRMED" && act(t.id, "COMPLETED", "Đã lái thử", "contained")}
                        {(t.status === "PENDING" || t.status === "CONFIRMED") && act(t.id, "CANCELLED", "Hủy", "outlined", "error")}
                        {(t.status === "COMPLETED" || t.status === "CANCELLED") && "–"}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>
                      Chưa có lịch lái thử nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </>
  );
}
