"use client";

import { ReactNode, useMemo, useState } from "react";
import NextLink from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import SearchIcon from "@mui/icons-material/Search";
import PageTitle from "@/components/PageTitle";

export interface Option {
  value: string | number;
  label: string;
}

export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  kind: "text" | "number" | "multiline" | "select" | "boolean";
  options?: Option[];
  required?: boolean;
  /** Hiển thị trong bảng. Truyền hàm để tự render ô. */
  table?: boolean | ((row: T) => ReactNode);
  /** Trong form, chiếm một nửa chiều rộng thay vì cả hàng. */
  half?: boolean;
}

export interface CrudApi<T> {
  list: (params?: Record<string, unknown>) => Promise<T[]>;
  get: (id: string) => Promise<T>;
  create: (body: Omit<T, "id">) => Promise<T>;
  update: (id: string, body: Omit<T, "id">) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

/** Giá trị hiển thị của một trường (nhãn của select, Có/Không của boolean, "–" khi trống). */
export function displayValue<T>(row: T, f: FieldDef<T>): string {
  const v = row[f.key] as unknown;
  if (f.kind === "select") return f.options?.find((o) => o.value === v)?.label ?? (v == null || v === "" ? "–" : String(v));
  if (f.kind === "boolean") return v ? "Có" : "Không";
  return v == null || v === "" ? "–" : String(v);
}

interface Props<T extends { id: string }> {
  title: string;
  /** Tên gọi một bản ghi (vd "ngày lễ"). */
  noun: string;
  /** Đường dẫn gốc của menu, vd "/dashboard/holidays". Trang chi tiết, thêm mới, sửa nằm dưới đường dẫn này. */
  basePath: string;
  queryKey: string;
  api: CrudApi<T>;
  fields: FieldDef<T>[];
  /** Dữ liệu phụ cần tải xong mới render (vd danh sách tỉnh). */
  ready?: boolean;
}

/** Trang danh sách. Xem, thêm, sửa đều chuyển sang trang riêng, chỉ xác nhận xóa dùng hộp thoại. */
export default function CrudPage<T extends { id: string }>({ title, noun, basePath, queryKey, api, fields, ready = true }: Props<T>) {
  const qc = useQueryClient();
  const { data = [], isPending, error } = useQuery({ queryKey: [queryKey], queryFn: () => api.list() });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [toast, setToast] = useState("");

  const tableFields = fields.filter((f) => f.table);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => fields.some((f) => displayValue(row, f).toLowerCase().includes(q)));
  }, [data, search, fields]);

  const remove = useMutation({
    mutationFn: (id: string) => api.remove(id),
    onSuccess: () => {
      setToast(`Đã xóa ${noun}`);
      setDeleting(null);
      qc.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (e: Error) => {
      setToast(e.message);
      setDeleting(null);
    },
  });

  const pageRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <PageTitle
        title={title}
        action={
          <Button component={NextLink} href={`${basePath}/new`} variant="contained" startIcon={<AddIcon />} sx={{ flexShrink: 0 }}>
            Thêm {noun}
          </Button>
        }
      />

      <Card>
        <CardHeader
          title={`Danh sách ${noun}`}
          titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
          subheader={`${rows.length} bản ghi`}
          action={
            <TextField
              size="small"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
          }
        />
        {error && <Alert severity="error" sx={{ mx: 3, mb: 2 }}>{(error as Error).message}</Alert>}
        {isPending || !ready ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  {tableFields.map((f) => (
                    <TableCell key={f.key}>{f.label}</TableCell>
                  ))}
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow key={row.id} hover>
                    {tableFields.map((f, i) => (
                      <TableCell key={f.key} sx={{ maxWidth: 320, fontWeight: i === 0 ? 600 : undefined }}>
                        {typeof f.table === "function" ? f.table(row) : displayValue(row, f)}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small" component={NextLink} href={`${basePath}/${row.id}`}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa">
                        <IconButton size="small" component={NextLink} href={`${basePath}/${row.id}/edit`} sx={{ color: "primary.main" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error" onClick={() => setDeleting(row)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={tableFields.length + 1} align="center" sx={{ py: 5, color: "text.secondary" }}>
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Số dòng"
        />
      </Card>

      <Dialog open={deleting !== null} onClose={() => setDeleting(null)}>
        <DialogTitle>Xóa {noun}?</DialogTitle>
        <DialogContent>
          <DialogContentText>Hành động này không thể hoàn tác.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleting(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={() => deleting && remove.mutate(deleting.id)} disabled={remove.isPending}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </>
  );
}
