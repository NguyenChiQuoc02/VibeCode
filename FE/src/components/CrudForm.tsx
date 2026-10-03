"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Card, CardContent, CircularProgress, FormControlLabel, Grid, MenuItem, Stack, Switch, TextField } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import PageTitle from "@/components/PageTitle";
import { CrudApi, FieldDef } from "@/components/CrudPage";

type Form = Record<string, string | number | boolean>;

interface Props<T extends { id: string }> {
  /** Đường dẫn gốc của menu, vd "/dashboard/holidays". */
  basePath: string;
  noun: string;
  queryKey: string;
  api: CrudApi<T>;
  fields: FieldDef<T>[];
  /** Giá trị ban đầu khi thêm mới. */
  blank: Omit<T, "id">;
  /** Có id thì là trang sửa, không có thì là trang thêm mới. */
  id?: string;
  /** Dữ liệu phụ cần tải xong mới render (vd danh sách tỉnh). */
  ready?: boolean;
}

function toForm<T>(fields: FieldDef<T>[], src: Record<string, unknown>): Form {
  const form: Form = {};
  for (const f of fields) form[f.key] = (src[f.key] ?? (f.kind === "boolean" ? false : "")) as string | number | boolean;
  return form;
}

/** Trang thêm mới / chỉnh sửa dùng chung cho các menu CRUD đơn giản. */
function CrudFormInner<T extends { id: string }>({ basePath, noun, queryKey, api, fields, blank, id }: Omit<Props<T>, "ready">) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = Boolean(id);

  const existing = useQuery({ queryKey: [queryKey, "detail", id], queryFn: () => api.get(id!), enabled: editing });
  const [form, setForm] = useState<Form>(() => toForm(fields, blank as Record<string, unknown>));
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(!editing);

  // Khi sửa: nạp bản ghi hiện có vào form.
  useEffect(() => {
    if (existing.data) {
      setForm(toForm(fields, existing.data as unknown as Record<string, unknown>));
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing.data]);

  const save = useMutation({
    mutationFn: (body: Omit<T, "id">) => (id ? api.update(id, body) : api.create(body)),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      router.push(`${basePath}/${saved.id}`);
    },
    onError: (e: Error) => setError(e.message),
  });

  const submit = () => {
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      const v = form[f.key];
      if (f.kind === "number") {
        if (v === "" || Number.isNaN(Number(v))) return setError(`${f.label} phải là số`);
        body[f.key] = Number(v);
      } else {
        if (f.required && (v === "" || v === undefined)) return setError(`${f.label} không được để trống`);
        body[f.key] = v;
      }
    }
    setError("");
    save.mutate(body as Omit<T, "id">);
  };

  if (editing && !initialized && existing.isPending) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (editing && existing.error) return <Alert severity="error">{(existing.error as Error).message}</Alert>;

  const input = (f: FieldDef<T>) => {
    const v = form[f.key] ?? "";
    const set = (value: string | number | boolean) => setForm((p) => ({ ...p, [f.key]: value }));
    if (f.kind === "boolean") return <FormControlLabel control={<Switch checked={Boolean(v)} onChange={(e) => set(e.target.checked)} />} label={f.label} />;
    return (
      <TextField
        fullWidth
        size="small"
        label={f.label}
        value={v}
        onChange={(e) => set(e.target.value)}
        required={f.required}
        select={f.kind === "select"}
        multiline={f.kind === "multiline"}
        minRows={f.kind === "multiline" ? 3 : undefined}
        type={f.kind === "number" ? "number" : "text"}
        inputProps={f.kind === "number" ? { step: "any" } : undefined}
        InputLabelProps={{ shrink: true }}
      >
        {f.kind === "select" &&
          f.options?.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
      </TextField>
    );
  };

  return (
    <>
      <Stack direction="row" alignItems="center" sx={{ mb: 1.5 }}>
        <Button component={NextLink} href={editing ? `${basePath}/${id}` : basePath} size="small" color="inherit" startIcon={<ArrowBackIcon fontSize="small" />} sx={{ color: "text.secondary" }}>
          Quay lại
        </Button>
      </Stack>
      <PageTitle navHref={basePath} title={editing ? `Chỉnh sửa ${noun}` : `Thêm mới ${noun}`} subtitle={editing ? `Cập nhật thông tin ${noun}` : `Nhập thông tin để thêm ${noun} mới`} />

      <Card>
        <CardContent>
          <Grid container spacing={2.5}>
            {fields.map((f) => (
              <Grid item xs={12} md={f.half ? 6 : 12} key={f.key}>
                {input(f)}
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
        <Button component={NextLink} href={editing ? `${basePath}/${id}` : basePath} variant="outlined" color="inherit">
          Hủy
        </Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={submit} disabled={save.isPending}>
          Lưu
        </Button>
      </Stack>
    </>
  );
}

/** Chờ dữ liệu phụ (vd danh sách tỉnh) rồi mới dựng form, để giá trị mặc định có sẵn ngay từ lần render đầu. */
export default function CrudForm<T extends { id: string }>({ ready = true, ...props }: Props<T>) {
  if (!ready) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  return <CrudFormInner {...props} />;
}
