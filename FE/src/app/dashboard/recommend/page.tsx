"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Card, CardContent, CardHeader, Chip, CircularProgress, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/context/ToastContext";
import { recommendApi } from "@/lib/api";

const EVENT_LABELS: Record<string, string> = {
  VIEW_TOUR: "Xem tour",
  FAVORITE_TOUR: "Yêu thích tour",
  VIEW_PLACE: "Xem địa điểm",
  SEARCH: "Tìm kiếm",
  RECOMMEND_VIEW: "Khối gợi ý được hiển thị",
  RECOMMEND_CLICK: "Bấm vào gợi ý",
};

const SOURCE_LABELS: Record<string, string> = {
  similar: "Tour tương tự",
  for_me: "Dành cho bạn",
  popular: "Đang được quan tâm",
  nearby: "Địa điểm lân cận",
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

/** Quản lý hệ thống gợi ý (admin): trạng thái mô hình, làm mới thủ công, số liệu hiệu quả gợi ý. */
export default function RecommendAdminPage() {
  const qc = useQueryClient();
  const toast = useToast();

  const status = useQuery({ queryKey: ["recommend", "status"], queryFn: recommendApi.status, refetchInterval: 30_000 });
  const metrics = useQuery({ queryKey: ["recommend", "metrics"], queryFn: () => recommendApi.metrics(30) });

  const refresh = useMutation({
    mutationFn: recommendApi.refresh,
    onSuccess: (data) => {
      qc.setQueryData(["recommend", "status"], data);
      qc.invalidateQueries({ queryKey: ["recommend", "metrics"] });
      toast.success("Đã làm mới mô hình gợi ý");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const s = status.data;
  const builtAt = s?.builtAt ? new Date(s.builtAt * 1000).toLocaleString("vi-VN") : "Chưa dựng";

  return (
    <>
      <PageTitle
        action={
          <Button variant="contained" startIcon={refresh.isPending ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />} disabled={refresh.isPending} onClick={() => refresh.mutate()}>
            Làm mới mô hình
          </Button>
        }
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        Mô hình tự dựng lại mỗi ngày vào 0 giờ (và khi dịch vụ khởi động). Bấm &quot;Làm mới mô hình&quot; sau khi thêm hoặc sửa tour để gợi ý cập nhật ngay.
      </Alert>

      {status.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(status.error as Error).message}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Trạng thái mô hình"
          titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
          action={s && <Chip size="small" color={s.ready ? "success" : "warning"} label={s.ready ? "Sẵn sàng" : "Đang khởi tạo"} />}
        />
        <CardContent>
          {status.isPending ? (
            <CircularProgress size={24} />
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Stat label="Dựng lần gần nhất" value={builtAt} />
              </Grid>
              <Grid item xs={6} md={3}>
                <Stat label="Số tour" value={s?.tours ?? 0} />
              </Grid>
              <Grid item xs={6} md={3}>
                <Stat label="Số địa điểm có tọa độ" value={s?.places ?? 0} />
              </Grid>
              <Grid item xs={6} md={3}>
                <Stat label="Người dùng có lịch sử" value={s?.usersWithHistory ?? 0} />
              </Grid>
            </Grid>
          )}
          {s && !s.eventsEnabled && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Chưa đọc được sự kiện hành vi từ MongoDB, gợi ý hiện chỉ dựa trên đăng ký tour.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={`Hiệu quả gợi ý (${metrics.data?.days ?? 30} ngày gần nhất)`} titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
        <CardContent>
          {metrics.isPending ? (
            <CircularProgress size={24} />
          ) : metrics.error ? (
            <Alert severity="error">{(metrics.error as Error).message}</Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle2" gutterBottom>
                  Sự kiện theo loại
                </Typography>
                <Table size="small">
                  <TableBody>
                    {Object.keys(EVENT_LABELS).map((k) => (
                      <TableRow key={k}>
                        <TableCell>{EVENT_LABELS[k]}</TableCell>
                        <TableCell align="right">{metrics.data?.byType[k] ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle2" gutterBottom>
                  Tỷ lệ bấm theo khối gợi ý
                </Typography>
                {metrics.data?.recommendSources.length ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Khối</TableCell>
                        <TableCell align="right">Hiển thị</TableCell>
                        <TableCell align="right">Lượt bấm</TableCell>
                        <TableCell align="right">Tỷ lệ bấm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.data.recommendSources.map((r) => (
                        <TableRow key={r.source}>
                          <TableCell>{SOURCE_LABELS[r.source] ?? r.source}</TableCell>
                          <TableCell align="right">{r.views}</TableCell>
                          <TableCell align="right">{r.clicks}</TableCell>
                          <TableCell align="right">{(r.clickRate * 100).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box sx={{ color: "text.secondary" }}>Chưa có dữ liệu hiển thị và bấm gợi ý.</Box>
                )}
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </>
  );
}
