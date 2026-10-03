"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import DescriptionIcon from "@mui/icons-material/Description";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import PageTitle from "@/components/PageTitle";
import PreviewImage from "@/components/PreviewImage";
import { fileApi, UploadedFile } from "@/lib/api";

// Phải khớp giới hạn của file-service (CloudinaryStorage).
const LIMITS: Record<UploadedFile["resourceType"], { exts: string[]; maxMb: number }> = {
  image: { exts: ["png", "jpg", "jpeg", "webp", "gif"], maxMb: 10 },
  video: { exts: ["mp4", "webm", "mov"], maxMb: 100 },
  raw: { exts: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt"], maxMb: 10 },
};
const ACCEPT = Object.values(LIMITS).flatMap((l) => l.exts.map((e) => `.${e}`)).join(",");

const META = {
  image: { icon: <ImageIcon />, color: "#00B8D9", label: "Ảnh" },
  video: { icon: <VideocamIcon />, color: "#8E33FF", label: "Video" },
  raw: { icon: <DescriptionIcon />, color: "#FFAB00", label: "Tài liệu" },
} as const;

const STORAGE_KEY = "vibecode_uploaded_files";

interface Pending {
  id: number;
  name: string;
  percent: number;
  error?: string;
}

function typeOf(file: File): UploadedFile["resourceType"] | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (Object.keys(LIMITS) as UploadedFile["resourceType"][]).find((k) => LIMITS[k].exts.includes(ext)) ?? null;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function FilesPage() {
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<Pending[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [toast, setToast] = useState("");

  // Chưa có metadata ở backend nên lưu danh sách file đã tải lên của trình duyệt này để không mất khi tải lại trang.
  useEffect(() => {
    try {
      setFiles(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
    } catch {
      setFiles([]);
    }
  }, []);

  const persist = (next: UploadedFile[]) => {
    setFiles(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const patchPending = (id: number, patch: Partial<Pending>) => setPending((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const uploadOne = async (file: File) => {
    const id = nextId.current++;
    setPending((p) => [...p, { id, name: file.name, percent: 0 }]);

    const kind = typeOf(file);
    if (!kind) return patchPending(id, { error: "Định dạng không được hỗ trợ" });
    if (file.size > LIMITS[kind].maxMb * 1024 * 1024) return patchPending(id, { error: `Vượt quá ${LIMITS[kind].maxMb}MB` });

    try {
      const uploaded = await fileApi.upload(file, (percent) => patchPending(id, { percent }));
      setFiles((prev) => {
        const next = [uploaded, ...prev];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setPending((p) => p.filter((x) => x.id !== id));
      setToast(`Đã tải lên ${file.name}`);
    } catch (e) {
      patchPending(id, { error: (e as Error).message });
    }
  };

  const handleFiles = (list: FileList | null) => {
    if (list) Array.from(list).forEach(uploadOne);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setToast("Đã sao chép đường dẫn");
  };

  return (
    <>
      <PageTitle subtitle="Tải ảnh, video, tài liệu lên Cloudinary qua file-service (cổng 8082)." />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            sx={{
              border: "1.5px dashed",
              borderColor: dragging ? "primary.main" : "rgba(145,158,171,0.5)",
              bgcolor: dragging ? "rgba(0,167,111,0.06)" : "transparent",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 44, color: "primary.main" }} />
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Kéo thả file vào đây hoặc bấm để chọn
            </Typography>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
              Ảnh (png, jpg, webp, gif) tối đa 10MB · Video (mp4, webm, mov) tối đa 100MB · Tài liệu (pdf, doc, docx, xls, xlsx, ppt, pptx, csv, txt) tối đa 10MB
            </Typography>
            <Button variant="contained" startIcon={<CloudUploadIcon />} sx={{ mt: 2 }} onClick={(e) => (e.stopPropagation(), input.current?.click())}>
              Chọn file
            </Button>
            <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={onPick} />
          </Box>

          {pending.length > 0 && (
            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {pending.map((p) => (
                <Box key={p.id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" noWrap sx={{ maxWidth: "70%" }}>
                      {p.name}
                    </Typography>
                    {p.error ? (
                      <Button size="small" color="inherit" onClick={() => setPending((x) => x.filter((i) => i.id !== p.id))}>
                        Đóng
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {p.percent < 100 ? `${p.percent}%` : "Đang xử lý trên Cloudinary..."}
                      </Typography>
                    )}
                  </Stack>
                  {p.error ? <Alert severity="error" sx={{ mt: 0.5 }}>{p.error}</Alert> : <LinearProgress variant={p.percent < 100 ? "determinate" : "indeterminate"} value={p.percent} sx={{ mt: 0.5, borderRadius: 1 }} />}
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="File đã tải lên"
          subheader={`${files.length} file (lưu trên trình duyệt này)`}
          action={
            files.length > 0 && (
              <Button color="inherit" size="small" onClick={() => persist([])}>
                Xóa danh sách
              </Button>
            )
          }
        />
        <CardContent sx={{ pt: 0 }}>
          {files.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
              Chưa có file nào. Tải một file lên để thử.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {files.map((f) => {
                const m = META[f.resourceType];
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={f.publicId}>
                    <Card variant="outlined">
                      <Box sx={{ height: 150, bgcolor: `${m.color}14`, display: "grid", placeItems: "center", overflow: "hidden" }}>
                        {f.resourceType === "image" ? (
                          <PreviewImage src={f.url} alt={f.originalName} caption={f.originalName} />
                        ) : f.resourceType === "video" ? (
                          <video src={f.url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Box sx={{ color: m.color, "& svg": { fontSize: 56 } }}>{m.icon}</Box>
                        )}
                      </Box>
                      <CardContent sx={{ pb: "12px !important" }}>
                        <Typography variant="subtitle2" noWrap title={f.originalName}>
                          {f.originalName}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" label={m.label} sx={{ bgcolor: `${m.color}1F`, color: m.color, fontWeight: 600 }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatBytes(f.bytes)}
                            </Typography>
                          </Stack>
                          <Stack direction="row">
                            <Tooltip title="Sao chép đường dẫn">
                              <IconButton size="small" onClick={() => copy(f.url)}>
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mở trong tab mới">
                              <IconButton size="small" component="a" href={f.url} target="_blank" rel="noreferrer">
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Bỏ khỏi danh sách (không xóa trên Cloudinary)">
                              <IconButton size="small" color="error" onClick={() => persist(files.filter((x) => x.publicId !== f.publicId))}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </>
  );
}
