"use client";

import { useEffect } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import CarsShell from "@/components/cars/CarsShell";
import { AUTO } from "@/components/cars/theme";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { testDriveApi } from "@/lib/api";
import { TEST_DRIVE_STATUS } from "@/lib/carFormat";
import { rememberNext } from "@/lib/loginRedirect";
import { formatDate } from "@/lib/tourFormat";

/** Lịch lái thử của người dùng đang đăng nhập; hủy được khi chưa lái thử. */
export default function MyTestDrivesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();

  // Chưa đăng nhập thì chuyển sang đăng nhập rồi quay lại đây.
  useEffect(() => {
    if (user === null && typeof window !== "undefined" && !localStorage.getItem("vibecode_token")) {
      rememberNext("/cars/my-test-drives");
      router.replace("/login");
    }
  }, [user, router]);

  const list = useQuery({ queryKey: ["test-drives", "mine"], queryFn: () => testDriveApi.mine(), enabled: Boolean(user) });
  const cancel = useMutation({
    mutationFn: (id: string) => testDriveApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["test-drives"] });
      toast.success("Đã hủy lịch lái thử");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <CarsShell>
      <Box sx={{ px: { xs: 2, md: "7%" }, py: 5, maxWidth: 1000 }}>
        <Typography component="h1" sx={{ fontWeight: 800, fontSize: 30, mb: 3 }}>Lịch lái thử của tôi</Typography>
        {list.isPending ? (
          <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>
        ) : list.isError ? (
          <Alert severity="error">{(list.error as Error).message}</Alert>
        ) : list.data.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", color: AUTO.muted }}>
            <Typography>Bạn chưa đặt lịch lái thử nào.</Typography>
            <Button component={NextLink} href="/cars/catalog" sx={{ mt: 2, color: AUTO.red }}>Chọn xe để lái thử</Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {list.data.map((t) => (
              <Stack key={t.id} direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ p: 2.5, borderRadius: 2, bgcolor: "#fff", border: `1px solid ${AUTO.line}`, boxShadow: AUTO.shadow }}>
                <Box>
                  <Typography component={NextLink} href={`/cars/${t.carId}`} sx={{ fontWeight: 700, color: AUTO.ink, textDecoration: "none", "&:hover": { color: AUTO.red } }}>{t.carName}</Typography>
                  <Typography sx={{ fontSize: 13, color: AUTO.muted, mt: 0.5 }}>Ngày hẹn {formatDate(t.preferredDate)} · {t.phone}</Typography>
                  {t.note && <Typography sx={{ fontSize: 12.5, color: AUTO.muted }}>{t.note}</Typography>}
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Chip size="small" color={TEST_DRIVE_STATUS[t.status].color} label={TEST_DRIVE_STATUS[t.status].label} />
                  {(t.status === "PENDING" || t.status === "CONFIRMED") && (
                    <Button size="small" color="error" variant="outlined" disabled={cancel.isPending} onClick={() => cancel.mutate(t.id)}>Hủy lịch</Button>
                  )}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </CarsShell>
  );
}
