"use client";

import { useParams } from "next/navigation";
import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Breadcrumbs, CircularProgress, Link, Stack, Typography } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CarsShell from "@/components/cars/CarsShell";
import TestDriveForm from "@/components/cars/TestDriveForm";
import { AUTO } from "@/components/cars/theme";
import PreviewImage from "@/components/PreviewImage";
import { carApi } from "@/lib/api";
import { carImage, formatCarPrice } from "@/lib/carFormat";

/** Chi tiết xe: ảnh (bấm để xem lớn), thông số và form đặt lịch lái thử. */
export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const car = useQuery({ queryKey: ["cars", "detail", id], queryFn: () => carApi.get(id) });
  const c = car.data;

  const specs: [string, string | number | undefined | null][] = c
    ? [
        ["Hãng", c.brand],
        ["Dòng xe", c.model],
        ["Kiểu thân xe", c.bodyType],
        ["Năm ra mắt", c.year],
        ["Nhiên liệu", c.fuel],
        ["Hộp số", c.transmission],
        ["Số chỗ", c.seats],
        ["Xuất xứ", c.country],
      ]
    : [];

  return (
    <CarsShell>
      <Box sx={{ px: { xs: 2, md: "7%" }, py: 4 }}>
        {car.isPending ? (
          <Box sx={{ py: 10, textAlign: "center" }}><CircularProgress /></Box>
        ) : car.isError || !c ? (
          <Alert severity="error">{(car.error as Error)?.message ?? "Không tìm thấy mẫu xe"}</Alert>
        ) : (
          <>
            <Breadcrumbs sx={{ mb: 2, fontSize: 13 }}>
              <Link component={NextLink} href="/cars" underline="hover" color="inherit">Trang chủ</Link>
              <Link component={NextLink} href="/cars/catalog" underline="hover" color="inherit">Xe mới</Link>
              <Typography sx={{ fontSize: 13 }} color="text.primary">{c.name}</Typography>
            </Breadcrumbs>

            <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" }, alignItems: "start" }}>
              <Box>
                <Box sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "#EEF0F3", minHeight: 280, display: "grid", placeItems: "center" }}>
                  {c.urlImage ? <PreviewImage src={carImage(c, 1280)} alt={c.name} sx={{ width: "100%", maxHeight: 520, objectFit: "cover" }} /> : <DirectionsCarIcon sx={{ fontSize: 90, color: "#C5CAD3" }} />}
                </Box>
                <Typography component="h1" sx={{ mt: 3, fontWeight: 800, fontSize: { xs: 26, md: 32 } }}>{c.name}</Typography>
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: 26, fontWeight: 800, color: AUTO.red }}>{formatCarPrice(c.price)}</Typography>
                  {c.priceEstimated && <Typography sx={{ fontSize: 12, color: AUTO.muted }}>Giá ước tính theo phân khúc, không phải giá niêm yết</Typography>}
                </Stack>
                {c.description && <Typography sx={{ mt: 2, lineHeight: 1.8, color: "#3A4150" }}>{c.description}</Typography>}

                <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5 }}>
                  {specs.filter(([, v]) => v !== undefined && v !== null && v !== "").map(([k, v]) => (
                    <Box key={k} sx={{ p: 1.75, borderRadius: 2, bgcolor: "#fff", border: `1px solid ${AUTO.line}` }}>
                      <Typography sx={{ fontSize: 11, color: AUTO.muted }}>{k}</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, mt: 0.25 }}>{String(v)}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box sx={{ position: { md: "sticky" }, top: 88 }}>
                <TestDriveForm car={c} />
              </Box>
            </Box>

          </>
        )}
      </Box>
    </CarsShell>
  );
}
