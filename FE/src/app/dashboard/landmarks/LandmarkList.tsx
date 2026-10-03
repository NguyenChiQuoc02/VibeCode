"use client";

import { ReactNode, useEffect, useState } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Popover,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleIcon from "@mui/icons-material/PauseCircleOutline";
import PageTitle from "@/components/PageTitle";
import StatusChip from "@/components/StatusChip";
import { Landmark, landmarkApi, LandmarkStatus } from "@/lib/api";
import { LANDMARK_CATEGORIES, LANDMARK_STATUS, RECOGNITION_LEVELS } from "@/lib/landmark";
import { useProvinces } from "@/lib/useProvinces";

const PAGE_SIZE = 8;

interface Opt {
  value: string | number;
  label: string;
}

function StatCard({ label, value, icon, color }: { label: string; value?: number; icon: ReactNode; color: string }) {
  return (
    <Card sx={{ p: 2, flex: 1, minWidth: 160 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", color, bgcolor: `${color}1F`, "& svg": { fontSize: 24 } }}>{icon}</Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5">{value ?? "–"}</Typography>
        </Box>
      </Stack>
    </Card>
  );
}

function Select({ label, value, onChange, options, allLabel }: { label: string; value: string | number; onChange: (v: string) => void; options: Opt[]; allLabel: string }) {
  return (
    <TextField select size="small" label={label} value={value} onChange={(e) => onChange(e.target.value)} sx={{ minWidth: 190 }} SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }}>
      <MenuItem value="">{allLabel}</MenuItem>
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function LandmarkList() {
  const qc = useQueryClient();
  const params = useSearchParams();
  const { provinces, options } = useProvinces();

  const [search, setSearch] = useState(params.get("q") ?? "");
  const [q, setQ] = useState(search.trim());
  const [provinceCode, setProvinceCode] = useState<number | "">("");
  const [status, setStatus] = useState<LandmarkStatus | "">("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [deleting, setDeleting] = useState<Landmark | null>(null);
  const [toast, setToast] = useState("");

  // Ô tìm kiếm ở header đẩy từ khóa qua ?q=.
  useEffect(() => {
    setSearch(params.get("q") ?? "");
  }, [params]);

  // Chờ người dùng ngừng gõ rồi mới gọi API.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const stats = useQuery({ queryKey: ["landmarks", "stats"], queryFn: landmarkApi.stats });
  const list = useQuery({
    queryKey: ["landmarks", "list", { q, provinceCode, status, category, level, page }],
    queryFn: () =>
      landmarkApi.list({
        q: q || undefined,
        provinceCode: provinceCode === "" ? undefined : provinceCode,
        status: status || undefined,
        category: category || undefined,
        level: level || undefined,
        page: page - 1,
        size: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  const provinceName = (code: number) => provinces.find((p) => p.code === code)?.name ?? "";
  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const activeExtra = [category, level].filter(Boolean).length;

  const remove = useMutation({
    mutationFn: async (l: Landmark) => {
      if (l.status === "DELETED") return landmarkApi.remove(l.id);
      // Xóa mềm: giữ bản ghi, chuyển sang trạng thái "Đã xóa".
      const { id: _id, ...body } = await landmarkApi.get(l.id);
      await landmarkApi.update(l.id, { ...body, status: "DELETED" });
    },
    onSuccess: (_, l) => {
      setToast(l.status === "DELETED" ? "Đã xóa vĩnh viễn" : "Đã chuyển vào mục Đã xóa");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["landmarks"] });
    },
    onError: (e: Error) => {
      setToast(e.message);
      setDeleting(null);
    },
  });

  const statusOptions = (Object.keys(LANDMARK_STATUS) as LandmarkStatus[]).map((k) => ({ value: k, label: LANDMARK_STATUS[k].label }));

  return (
    <>
      <PageTitle
        action={
          <Button component={NextLink} href="/dashboard/landmarks/new" variant="contained" startIcon={<AddIcon />} sx={{ flexShrink: 0 }}>
            Thêm mới
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }} useFlexGap flexWrap="wrap">
        <StatCard label="Tổng số" value={stats.data?.total} icon={<AccountBalanceIcon />} color="#00A76F" />
        <StatCard label="Đang hoạt động" value={stats.data?.active} icon={<CheckCircleIcon />} color="#22C55E" />
        <StatCard label="Tạm ngừng" value={stats.data?.paused} icon={<PauseCircleIcon />} color="#FFAB00" />
        <StatCard label="Đã xóa" value={stats.data?.deleted} icon={<DeleteIcon />} color="#FF5630" />
      </Stack>

      <Card>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ p: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm theo tên di tích..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <Select
            label="Tỉnh/Thành phố"
            value={provinceCode}
            onChange={(v) => {
              setProvinceCode(v === "" ? "" : Number(v));
              setPage(1);
            }}
            options={options}
            allLabel="Tất cả tỉnh/thành"
          />
          <Select
            label="Trạng thái"
            value={status}
            onChange={(v) => {
              setStatus(v as LandmarkStatus | "");
              setPage(1);
            }}
            options={statusOptions}
            allLabel="Tất cả trạng thái"
          />
          <Button variant="outlined" color={activeExtra ? "primary" : "inherit"} startIcon={<FilterListIcon />} onClick={(e) => setFilterAnchor(e.currentTarget)} sx={{ flexShrink: 0 }}>
            Lọc khác{activeExtra ? ` (${activeExtra})` : ""}
          </Button>
        </Stack>

        {list.error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{(list.error as Error).message}</Alert>}

        <Box sx={{ overflowX: "auto", opacity: list.isPlaceholderData ? 0.6 : 1, transition: "opacity .15s" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={56}>STT</TableCell>
                <TableCell>Tên di tích / danh thắng</TableCell>
                <TableCell>Phân loại</TableCell>
                <TableCell>Tỉnh/Thành phố</TableCell>
                <TableCell>Công nhận</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.isPending && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {items.map((l, i) => (
                <TableRow key={l.id} hover>
                  <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, maxWidth: 320 }}>
                    <NextLink href={`/dashboard/landmarks/${l.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {l.name}
                    </NextLink>
                  </TableCell>
                  <TableCell>{l.category}</TableCell>
                  <TableCell>{provinceName(l.provinceCode)}</TableCell>
                  <TableCell>{l.recognitionLevel ?? "–"}</TableCell>
                  <TableCell>
                    <StatusChip status={l.status} />
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title="Xem chi tiết">
                      <IconButton size="small" component={NextLink} href={`/dashboard/landmarks/${l.id}`}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <IconButton size="small" component={NextLink} href={`/dashboard/landmarks/${l.id}/edit`} sx={{ color: "primary.main" }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={l.status === "DELETED" ? "Xóa vĩnh viễn" : "Xóa"}>
                      <IconButton size="small" color="error" onClick={() => setDeleting(l)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!list.isPending && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={1} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {from} - {to} trong {total} kết quả
          </Typography>
          <Pagination count={Math.max(1, Math.ceil(total / PAGE_SIZE))} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" size="small" siblingCount={1} />
        </Stack>
      </Card>

      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Stack spacing={2} sx={{ p: 2, width: 280 }}>
          <Select
            label="Phân loại"
            value={category}
            onChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
            options={LANDMARK_CATEGORIES.map((c) => ({ value: c, label: c }))}
            allLabel="Tất cả phân loại"
          />
          <Select
            label="Công nhận"
            value={level}
            onChange={(v) => {
              setLevel(v);
              setPage(1);
            }}
            options={RECOGNITION_LEVELS.map((c) => ({ value: c, label: c }))}
            allLabel="Tất cả mức công nhận"
          />
          <Button
            onClick={() => {
              setCategory("");
              setLevel("");
            }}
            disabled={!activeExtra}
          >
            Xóa bộ lọc
          </Button>
        </Stack>
      </Popover>

      <Dialog open={deleting !== null} onClose={() => setDeleting(null)}>
        <DialogTitle>{deleting?.status === "DELETED" ? "Xóa vĩnh viễn?" : "Xóa di tích?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleting?.status === "DELETED"
              ? `"${deleting?.name}" sẽ bị xóa khỏi hệ thống và không thể khôi phục.`
              : `"${deleting?.name}" sẽ được chuyển sang trạng thái Đã xóa. Bạn vẫn có thể khôi phục bằng cách sửa trạng thái.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleting(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={() => deleting && remove.mutate(deleting)} disabled={remove.isPending}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </>
  );
}
