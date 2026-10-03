"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import ImageLightbox from "@/components/ImageLightbox";
import PageTitle from "@/components/PageTitle";
import { fileApi, Landmark, landmarkApi, LandmarkStatus } from "@/lib/api";
import { LANDMARK_CATEGORIES, LANDMARK_STATUS, RECOGNITION_LEVELS } from "@/lib/landmark";
import { useProvinces } from "@/lib/useProvinces";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

interface FormState {
  name: string;
  category: string;
  provinceCode: number | "";
  address: string;
  latitude: string;
  longitude: string;
  recognitionLevel: string;
  recognitionYear: string;
  areaKm2: string;
  status: LandmarkStatus;
  description: string;
  detail: string;
  highlights: string;
  images: string[];
}

const BLANK: FormState = {
  name: "",
  category: LANDMARK_CATEGORIES[4],
  provinceCode: "",
  address: "",
  latitude: "",
  longitude: "",
  recognitionLevel: "",
  recognitionYear: "",
  areaKm2: "",
  status: "ACTIVE",
  description: "",
  detail: "",
  highlights: "",
  images: [],
};

function fromLandmark(l: Landmark): FormState {
  // urlImage có thể là ảnh đại diện nằm ngoài danh sách images (dữ liệu thu thập).
  const images = [...(l.images ?? [])];
  if (l.urlImage && !images.includes(l.urlImage)) images.unshift(l.urlImage);
  return {
    name: l.name,
    category: l.category,
    provinceCode: l.provinceCode,
    address: l.address ?? "",
    latitude: String(l.latitude),
    longitude: String(l.longitude),
    recognitionLevel: l.recognitionLevel ?? "",
    recognitionYear: l.recognitionYear ? String(l.recognitionYear) : "",
    areaKm2: l.areaKm2 ? String(l.areaKm2) : "",
    status: l.status ?? "ACTIVE",
    description: l.description ?? "",
    detail: l.detail ?? "",
    highlights: (l.highlights ?? []).join("\n"),
    images,
  };
}

export default function LandmarkForm({ id }: { id?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { options } = useProvinces();
  const editing = Boolean(id);

  const existing = useQuery({ queryKey: ["landmarks", "detail", id], queryFn: () => landmarkApi.get(id!), enabled: editing });
  const [form, setForm] = useState<FormState>(BLANK);
  const [source, setSource] = useState<Pick<Landmark, "source" | "sourceId"> | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing.data) {
      setForm(fromLandmark(existing.data));
      setSource({ source: existing.data.source, sourceId: existing.data.sourceId });
    }
  }, [existing.data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((p) => ({ ...p, [key]: value }));

  const save = useMutation({
    mutationFn: (body: Omit<Landmark, "id">) => (id ? landmarkApi.update(id, body) : landmarkApi.create(body)),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ["landmarks"] });
      router.push(`/dashboard/landmarks/${saved.id}`);
    },
    onError: (e: Error) => setError(e.message),
  });

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const bad = list.find((f) => !/^image\/(png|jpe?g|webp|gif)$/.test(f.type) || f.size > MAX_IMAGE_BYTES);
    if (bad) {
      setError(`"${bad.name}" không hợp lệ. Chỉ nhận ảnh PNG, JPG, WEBP, GIF tối đa 10MB.`);
      return;
    }
    setError("");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of list) urls.push(await fileApi.uploadImage(f));
      setForm((p) => ({ ...p, images: [...p.images, ...urls] }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadFiles(e.target.files);
    e.target.value = "";
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!/^https?:\/\//i.test(url)) return setError("Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://");
    setError("");
    set("images", [...form.images, url]);
    setImageUrl("");
  };

  const submit = () => {
    const required: [string, unknown][] = [
      ["Tên di tích / danh thắng", form.name.trim()],
      ["Phân loại", form.category],
      ["Tỉnh/Thành phố", form.provinceCode],
      ["Mô tả ngắn", form.description.trim()],
    ];
    const missing = required.find(([, v]) => v === "" || v === undefined);
    if (missing) return setError(`${missing[0]} không được để trống`);

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (form.latitude === "" || form.longitude === "" || Number.isNaN(lat) || Number.isNaN(lng)) return setError("Vĩ độ và kinh độ phải là số");
    if (form.recognitionYear && !/^\d{4}$/.test(form.recognitionYear)) return setError("Năm công nhận phải gồm 4 chữ số");

    setError("");
    save.mutate({
      name: form.name.trim(),
      category: form.category,
      provinceCode: form.provinceCode as number,
      address: form.address.trim(),
      latitude: lat,
      longitude: lng,
      recognitionLevel: form.recognitionLevel || undefined,
      recognitionYear: form.recognitionYear ? Number(form.recognitionYear) : null,
      areaKm2: form.areaKm2 ? Number(form.areaKm2) : null,
      status: form.status,
      description: form.description.trim(),
      detail: form.detail.trim(),
      highlights: form.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      images: form.images,
      urlImage: form.images[0],
      source: source?.source ?? "Nhập tay",
      sourceId: source?.sourceId,
    });
  };

  if (editing && existing.isPending) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (editing && existing.error) return <Alert severity="error">{(existing.error as Error).message}</Alert>;

  const field = (label: string, key: keyof FormState, extra?: { required?: boolean; multiline?: number; type?: string; placeholder?: string }) => (
    <TextField
      fullWidth
      size="small"
      label={label}
      required={extra?.required}
      placeholder={extra?.placeholder}
      type={extra?.type}
      multiline={Boolean(extra?.multiline)}
      minRows={extra?.multiline}
      value={form[key] as string}
      onChange={(e) => set(key, e.target.value as never)}
      InputLabelProps={{ shrink: true }}
    />
  );

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5 }}>
        <Button component={NextLink} href="/dashboard/landmarks" size="small" color="inherit" startIcon={<ArrowBackIcon fontSize="small" />} sx={{ color: "text.secondary" }}>
          Quay lại
        </Button>
      </Stack>
      <PageTitle
        navHref="/dashboard/landmarks"
        title={editing ? "Chỉnh sửa di tích, thắng cảnh" : "Thêm mới di tích, thắng cảnh"}
        subtitle={editing ? "Cập nhật thông tin di tích, thắng cảnh" : "Nhập thông tin chi tiết để thêm mới di tích, thắng cảnh"}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Thông tin cơ bản" titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
            <CardContent>
              <Stack spacing={2.5}>
                {field("Tên di tích / danh thắng", "name", { required: true, placeholder: "Nhập tên di tích, danh thắng" })}
                <TextField select fullWidth size="small" label="Phân loại" required value={form.category} onChange={(e) => set("category", e.target.value)} InputLabelProps={{ shrink: true }}>
                  {LANDMARK_CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tỉnh/Thành phố"
                  required
                  value={form.provinceCode}
                  onChange={(e) => set("provinceCode", Number(e.target.value))}
                  SelectProps={{ displayEmpty: true }}
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value="" disabled>
                    Chọn tỉnh/thành phố
                  </MenuItem>
                  {options.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
                {field("Địa chỉ", "address", { placeholder: "Số nhà, đường, xã/phường" })}
                <Stack direction="row" spacing={2}>
                  {field("Vĩ độ", "latitude", { type: "number", required: true })}
                  {field("Kinh độ", "longitude", { type: "number", required: true })}
                </Stack>
                <TextField select fullWidth size="small" label="Công nhận" value={form.recognitionLevel} onChange={(e) => set("recognitionLevel", e.target.value)} SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }}>
                  <MenuItem value="">Chưa xếp hạng</MenuItem>
                  {RECOGNITION_LEVELS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
                <Stack direction="row" spacing={2}>
                  {field("Năm công nhận", "recognitionYear", { type: "number", placeholder: "VD: 1994" })}
                  {field("Diện tích (km²)", "areaKm2", { type: "number" })}
                </Stack>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Trạng thái
                  </Typography>
                  <RadioGroup row value={form.status} onChange={(e) => set("status", e.target.value as LandmarkStatus)}>
                    {(Object.keys(LANDMARK_STATUS) as LandmarkStatus[])
                      .filter((k) => k !== "DELETED" || form.status === "DELETED")
                      .map((k) => (
                        <FormControlLabel key={k} value={k} control={<Radio size="small" />} label={<Typography variant="body2">{LANDMARK_STATUS[k].label}</Typography>} />
                      ))}
                  </RadioGroup>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Thông tin chi tiết" titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
            <CardContent>
              <Stack spacing={2.5}>
                {field("Mô tả ngắn", "description", { required: true, multiline: 3, placeholder: "Nhập mô tả ngắn..." })}
                {field("Mô tả chi tiết", "detail", { multiline: 4, placeholder: "Nhập mô tả chi tiết..." })}
                {field("Đặc điểm nổi bật (mỗi dòng một ý)", "highlights", { multiline: 3 })}

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Hình ảnh
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="stretch" flexWrap="wrap" useFlexGap>
                    <Box
                      onClick={() => fileInput.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      sx={{
                        flex: 1,
                        minWidth: 220,
                        minHeight: 130,
                        border: "1.5px dashed",
                        borderColor: dragging ? "primary.main" : "rgba(145,158,171,0.5)",
                        bgcolor: dragging ? "rgba(0,167,111,0.06)" : "transparent",
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        textAlign: "center",
                        cursor: "pointer",
                        p: 2,
                      }}
                    >
                      <Stack alignItems="center" spacing={0.5}>
                        {uploading ? <CircularProgress size={26} /> : <CloudUploadIcon sx={{ color: "text.disabled", fontSize: 32 }} />}
                        <Typography variant="caption" color="text.secondary">
                          Kéo thả ảnh vào đây hoặc <Box component="span" sx={{ color: "primary.main", textDecoration: "underline" }}>chọn file</Box>
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Hỗ trợ: JPG, PNG, WEBP (tối đa 10MB)
                        </Typography>
                      </Stack>
                      <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={onPick} />
                    </Box>

                    {form.images.map((src, i) => (
                      <Box key={`${src}-${i}`} sx={{ position: "relative", width: 96, height: 96, borderRadius: 2, overflow: "hidden", border: i === 0 ? "2px solid" : "1px solid", borderColor: i === 0 ? "primary.main" : "divider" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" onClick={() => setPreview(i)} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }} referrerPolicy="no-referrer" />
                        {i === 0 && (
                          <Typography variant="caption" sx={{ position: "absolute", left: 0, bottom: 0, right: 0, bgcolor: "rgba(0,0,0,0.55)", color: "#fff", textAlign: "center", fontSize: 10 }}>
                            Ảnh đại diện
                          </Typography>
                        )}
                        <IconButton size="small" onClick={() => set("images", form.images.filter((_, j) => j !== i))} sx={{ position: "absolute", top: 2, right: 2, bgcolor: "rgba(0,0,0,0.55)", color: "#fff", p: 0.25, "&:hover": { bgcolor: "rgba(0,0,0,0.75)" } }}>
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <TextField fullWidth size="small" placeholder="Hoặc dán đường dẫn ảnh (https://...)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())} />
                    <Button variant="outlined" onClick={addImageUrl} sx={{ flexShrink: 0 }}>
                      Thêm
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ImageLightbox images={form.images} index={preview} onClose={() => setPreview(null)} onIndexChange={setPreview} caption={form.name} />

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
        <Button component={NextLink} href="/dashboard/landmarks" variant="outlined" color="inherit">
          Hủy
        </Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={submit} disabled={save.isPending || uploading}>
          Lưu
        </Button>
      </Stack>
    </>
  );
}
