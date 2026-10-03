"use client";

import { ReactNode } from "react";
import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Breadcrumbs, Button, Card, CardContent, CardHeader, CircularProgress, Grid, Link, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/EditOutlined";
import { CrudApi, displayValue, FieldDef } from "@/components/CrudPage";

interface Props<T extends { id: string }> {
  /** Đường dẫn gốc của menu, vd "/dashboard/holidays". */
  basePath: string;
  /** Tên menu hiển thị ở breadcrumb. */
  menuLabel: string;
  queryKey: string;
  api: CrudApi<T>;
  fields: FieldDef<T>[];
  id: string;
  /** Tiêu đề trang, mặc định là giá trị trường `name`. */
  heading?: (row: T) => string;
  /** Khối nổi bật phía trên (vd ảnh). */
  hero?: (row: T) => ReactNode;
  /** Khối bên phải cạnh thông tin (vd bản đồ). */
  side?: (row: T) => ReactNode;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 150, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: "pre-line" }} component="div">
        {children}
      </Typography>
    </Stack>
  );
}

/** Trang chi tiết (chỉ xem) dùng chung cho các menu CRUD đơn giản. */
export default function CrudDetail<T extends { id: string }>({ basePath, menuLabel, queryKey, api, fields, id, heading, hero, side }: Props<T>) {
  const q = useQuery({ queryKey: [queryKey, "detail", id], queryFn: () => api.get(id) });

  if (q.isPending) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (q.error || !q.data) return <Alert severity="error">{(q.error as Error)?.message ?? "Không tìm thấy bản ghi"}</Alert>;

  const row = q.data;
  const title = heading ? heading(row) : String((row as unknown as { name?: string }).name ?? "");

  const info = (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardHeader title="Thông tin chi tiết" titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
      <CardContent sx={{ pt: 0 }}>
        {fields.map((f) => (
          <Row key={f.key} label={f.label}>
            {displayValue(row, f)}
          </Row>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button component={NextLink} href={basePath} size="small" color="inherit" sx={{ minWidth: 0, color: "text.secondary" }}>
            <ArrowBackIcon fontSize="small" />
          </Button>
          <Breadcrumbs>
            <Link component={NextLink} href={basePath} underline="hover" color="text.secondary" variant="body2">
              {menuLabel}
            </Link>
            <Typography variant="body2" color="text.primary">
              Chi tiết
            </Typography>
          </Breadcrumbs>
        </Stack>
        <Button component={NextLink} href={`${basePath}/${id}/edit`} variant="contained" size="small" startIcon={<EditIcon fontSize="small" />}>
          Sửa
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {title}
          </Typography>
          {hero?.(row)}
          {side ? (
            <Grid container spacing={2} sx={{ mt: hero ? 0.5 : 0 }}>
              <Grid item xs={12} md={8}>
                {info}
              </Grid>
              <Grid item xs={12} md={4}>
                {side(row)}
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ mt: hero ? 2 : 0 }}>{info}</Box>
          )}
        </CardContent>
      </Card>
    </>
  );
}
