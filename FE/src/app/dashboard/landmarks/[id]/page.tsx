"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/EditOutlined";
import PlaceIcon from "@mui/icons-material/Place";
import FlagIcon from "@mui/icons-material/OutlinedFlag";
import MapIcon from "@mui/icons-material/Map";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ImageLightbox from "@/components/ImageLightbox";
import StatusChip from "@/components/StatusChip";
import { destinationApi, Landmark, landmarkApi } from "@/lib/api";
import { useProvinces } from "@/lib/useProvinces";

const MiniMap = dynamic(() => import("@/components/MiniMap"), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
      <CircularProgress size={24} />
    </Box>
  ),
});

function Img({ src, alt = "", sx }: { src: string; alt?: string; sx?: object }) {
  // Ảnh thu thập từ nguồn ngoài nên bỏ referrer để không bị chặn hotlink.
  // eslint-disable-next-line @next/next/no-img-element
  return <Box component="img" src={src} alt={alt} referrerPolicy="no-referrer" loading="lazy" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...sx }} />;
}

function Gallery({ landmark, onPreview }: { landmark: Landmark; onPreview: (index: number) => void }) {
  const images = Array.from(new Set([landmark.urlImage, ...(landmark.images ?? [])].filter((s): s is string => Boolean(s))));
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  const side = images.map((src, i) => ({ src, i })).filter(({ i }) => i !== active).slice(0, 4);
  const more = images.length - 1 - side.length;

  return (
    <Stack direction="row" spacing={1.5} sx={{ height: { xs: 260, md: 340 } }}>
      <Box sx={{ position: "relative", flex: 1, borderRadius: 2, overflow: "hidden", background: "linear-gradient(135deg, #5BE49B 0%, #007867 100%)" }}>
        {main ? (
          <Box onClick={() => onPreview(images.indexOf(main))} sx={{ position: "absolute", inset: 0, cursor: "zoom-in" }}>
            <Img src={main} alt={landmark.name} />
          </Box>
        ) : <AccountBalanceIcon sx={{ position: "absolute", inset: 0, m: "auto", fontSize: 96, color: "rgba(255,255,255,0.5)" }} />}
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: 12, right: 12, bgcolor: "#fff", borderRadius: 3 }}>
          <StatusChip status={landmark.status} />
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: "absolute", left: 16, bottom: 16, right: 16, color: "#fff" }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#fff", color: "primary.main", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <AccountBalanceIcon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {landmark.name}
            </Typography>
            <Chip size="small" label={landmark.category} sx={{ mt: 0.5, bgcolor: "rgba(255,255,255,0.25)", color: "#fff", height: 20, fontSize: 11 }} />
          </Box>
        </Stack>
      </Box>

      {side.length > 0 && (
        <Stack spacing={1.5} sx={{ width: 96, flexShrink: 0, display: { xs: "none", sm: "flex" } }}>
          {side.map(({ src, i }, k) => (
            <Box key={src} onClick={() => setActive(i)} sx={{ position: "relative", flex: 1, minHeight: 0, borderRadius: 2, overflow: "hidden", cursor: "pointer" }}>
              <Img src={src} />
              {k === side.length - 1 && more > 0 && (
                <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.5)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700 }}>+{more}</Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 150, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }} component="div">
        {children}
      </Typography>
    </Stack>
  );
}

export default function LandmarkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { provinces } = useProvinces();
  const [tab, setTab] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);

  const q = useQuery({ queryKey: ["landmarks", "detail", id], queryFn: () => landmarkApi.get(id) });
  const l = q.data;
  const province = provinces.find((p) => p.code === l?.provinceCode)?.name ?? "";

  const places = useQuery({ queryKey: ["destinations", "province", l?.provinceCode], queryFn: () => destinationApi.list({ provinceCode: l!.provinceCode }), enabled: Boolean(l) && tab === 2 });
  const related = useQuery({
    queryKey: ["landmarks", "related", l?.provinceCode],
    queryFn: () => landmarkApi.list({ provinceCode: l!.provinceCode, page: 0, size: 12 }),
    enabled: Boolean(l) && tab === 3,
  });

  if (q.isPending) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (q.error || !l) return <Alert severity="error">{(q.error as Error)?.message ?? "Không tìm thấy di tích"}</Alert>;

  const images = Array.from(new Set([l.urlImage, ...(l.images ?? [])].filter((s): s is string => Boolean(s))));

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button component={NextLink} href="/dashboard/landmarks" size="small" color="inherit" sx={{ minWidth: 0, color: "text.secondary" }}>
            <ArrowBackIcon fontSize="small" />
          </Button>
          <Breadcrumbs>
            <Link component={NextLink} href="/dashboard/landmarks" underline="hover" color="text.secondary" variant="body2">
              Di tích, thắng cảnh
            </Link>
            <Typography variant="body2" color="text.primary">
              Chi tiết
            </Typography>
          </Breadcrumbs>
        </Stack>
        <Button component={NextLink} href={`/dashboard/landmarks/${l.id}/edit`} variant="contained" size="small" startIcon={<EditIcon fontSize="small" />}>
          Sửa
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Gallery landmark={l} onPreview={setPreview} />

          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PlaceIcon fontSize="small" color="primary" />
              <Typography variant="body2">{province}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FlagIcon fontSize="small" color="primary" />
              <Typography variant="body2">{l.recognitionLevel ?? "Chưa xếp hạng"}</Typography>
            </Stack>
          </Stack>

          <Typography variant="body2" sx={{ mt: 1.5 }}>
            {l.description}
          </Typography>

          <Grid container sx={{ mt: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            {[
              ["Diện tích", l.areaKm2 ? `${l.areaKm2.toLocaleString("vi-VN")} km²` : "–"],
              ["Năm công nhận", l.recognitionYear ?? "–"],
              ["Loại hình", l.category],
            ].map(([k, v], i) => (
              <Grid item xs={12} sm={4} key={k} sx={{ p: 2, borderLeft: { sm: i ? "1px solid" : "none" }, borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary">
                  {k}
                </Typography>
                <Typography variant="subtitle2">{v}</Typography>
              </Grid>
            ))}
          </Grid>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Tab label="Thông tin chung" />
            <Tab label={`Hình ảnh (${images.length})`} />
            <Tab label="Địa điểm tham quan" />
            <Tab label="Liên kết" />
          </Tabs>

          <Box sx={{ pt: 2.5 }}>
            {tab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardHeader title="Thông tin chi tiết" titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
                    <CardContent sx={{ pt: 0 }}>
                      <Row label="Phân loại">{l.category}</Row>
                      <Row label="Tỉnh/Thành phố">{province}</Row>
                      <Row label="Địa chỉ">{l.address || "–"}</Row>
                      <Row label="Công nhận">{l.recognitionLevel ?? "–"}</Row>
                      <Row label="Năm công nhận">{l.recognitionYear ?? "–"}</Row>
                      <Row label="Tọa độ">
                        {l.latitude.toFixed(5)}, {l.longitude.toFixed(5)}
                      </Row>
                      {l.source && <Row label="Nguồn dữ liệu">{l.source}</Row>}
                      {l.detail && (
                        <Row label="Mô tả chi tiết">
                          <Box sx={{ whiteSpace: "pre-line" }}>{l.detail}</Box>
                        </Row>
                      )}
                      {(l.highlights?.length ?? 0) > 0 && (
                        <Row label="Đặc điểm nổi bật">
                          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                            {l.highlights!.map((h) => (
                              <li key={h}>{h}</li>
                            ))}
                          </Box>
                        </Row>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardHeader title="Bản đồ vị trí" titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
                    <CardContent sx={{ pt: 0 }}>
                      <Box sx={{ height: 200, borderRadius: 2, overflow: "hidden" }}>
                        <MiniMap lat={l.latitude} lng={l.longitude} />
                      </Box>
                      <Button
                        component={NextLink}
                        href={`/dashboard/map?province=${l.provinceCode}&lat=${l.latitude}&lng=${l.longitude}&landmarks=1`}
                        fullWidth
                        variant="contained"
                        startIcon={<MapIcon />}
                        sx={{ mt: 2 }}
                      >
                        Xem trên bản đồ
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {tab === 1 &&
              (images.length === 0 ? (
                <Typography color="text.secondary">Chưa có hình ảnh.</Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {images.map((src, i) => (
                    <Grid item xs={6} sm={4} md={3} key={src}>
                      <Box onClick={() => setPreview(i)} sx={{ aspectRatio: "4 / 3", borderRadius: 2, overflow: "hidden", cursor: "zoom-in" }}>
                        <Img src={src} alt={l.name} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ))}

            {tab === 2 &&
              (places.isPending ? (
                <CircularProgress size={24} />
              ) : (places.data ?? []).length === 0 ? (
                <Typography color="text.secondary">Chưa có địa điểm tham quan trong {province}.</Typography>
              ) : (
                <List dense disablePadding>
                  {places.data!.slice(0, 30).map((d) => (
                    <ListItem key={d.id} divider>
                      <ListItemText primary={d.name} secondary={[d.type, d.address].filter(Boolean).join(" · ")} primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItem>
                  ))}
                </List>
              ))}

            {tab === 3 &&
              (related.isPending ? (
                <CircularProgress size={24} />
              ) : (
                <List dense disablePadding>
                  {related.data!.items
                    .filter((r) => r.id !== l.id)
                    .map((r) => (
                      <ListItem key={r.id} divider component={NextLink} href={`/dashboard/landmarks/${r.id}`} sx={{ color: "inherit" }}>
                        <ListItemText primary={r.name} secondary={r.category} primaryTypographyProps={{ fontWeight: 600 }} />
                      </ListItem>
                    ))}
                </List>
              ))}
          </Box>
        </CardContent>
      </Card>

      <ImageLightbox images={images} index={preview} onClose={() => setPreview(null)} onIndexChange={setPreview} caption={l.name} />
    </>
  );
}
