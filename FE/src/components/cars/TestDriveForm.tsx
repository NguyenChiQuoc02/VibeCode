"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { AUTO } from "@/components/cars/theme";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Car, testDriveApi } from "@/lib/api";
import { rememberNext } from "@/lib/loginRedirect";
import { todayIso } from "@/lib/tourFormat";

/** Form đặt lịch lái thử; cần đăng nhập (như đăng ký tour). */
export default function TestDriveForm({ car }: { car: Car }) {
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const pathname = usePathname();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const book = useMutation({
    mutationFn: () => testDriveApi.book({ carId: car.id, fullName: fullName.trim(), phone: phone.trim(), preferredDate: date, note: note.trim() }),
    onSuccess: () => {
      setDone(true);
      qc.invalidateQueries({ queryKey: ["test-drives"] });
      toast.success("Đã gửi lịch lái thử, chúng tôi sẽ liên hệ xác nhận");
    },
    onError: (e: Error) => setError(e.message),
  });

  if (!user) {
    return (
      <Box sx={{ p: 3, borderRadius: 2, bgcolor: "#fff", border: `1px solid ${AUTO.line}`, boxShadow: AUTO.shadow }}>
        <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Đặt lịch lái thử</Typography>
        <Typography sx={{ mt: 1, fontSize: 13, color: AUTO.muted }}>Vui lòng đăng nhập để đặt lịch lái thử miễn phí.</Typography>
        <Button component={NextLink} href="/login" onClick={() => rememberNext(pathname)} variant="contained" fullWidth sx={{ mt: 2, bgcolor: AUTO.red, boxShadow: "none", "&:hover": { bgcolor: AUTO.redDark, boxShadow: "none" } }}>
          Đăng nhập để đặt lịch
        </Button>
      </Box>
    );
  }

  if (done) {
    return (
      <Box sx={{ p: 3, borderRadius: 2, bgcolor: "#fff", border: `1px solid ${AUTO.line}`, boxShadow: AUTO.shadow }}>
        <Alert severity="success">Đã gửi lịch lái thử {car.name} vào ngày {date.split("-").reverse().join("/")}. Chúng tôi sẽ liên hệ qua số {phone} để xác nhận.</Alert>
        <Button component={NextLink} href="/cars/my-test-drives" fullWidth sx={{ mt: 2, color: AUTO.red }}>Xem lịch lái thử của tôi</Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={(e) => { e.preventDefault(); setError(""); book.mutate(); }} sx={{ p: 3, borderRadius: 2, bgcolor: "#fff", border: `1px solid ${AUTO.line}`, boxShadow: AUTO.shadow }}>
      <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Đặt lịch lái thử</Typography>
      <Typography sx={{ fontSize: 12.5, color: AUTO.muted, mb: 2 }}>Miễn phí, nhân viên sẽ liên hệ xác nhận.</Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField size="small" label="Họ tên" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <TextField size="small" label="Số điện thoại" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField size="small" type="date" label="Ngày lái thử" required value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: todayIso() }} />
        <TextField size="small" label="Ghi chú" multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" variant="contained" disabled={book.isPending} sx={{ bgcolor: AUTO.red, py: 1.1, fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: AUTO.redDark, boxShadow: "none" } }}>
          {book.isPending ? "Đang gửi..." : "Đặt lịch lái thử"}
        </Button>
      </Stack>
    </Box>
  );
}
