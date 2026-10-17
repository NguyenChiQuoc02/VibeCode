"use client";

import { FormEvent, useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Grid, MenuItem, Stack, TextField } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import PageTitle from "@/components/PageTitle";
import PlacePicker from "@/components/tour/PlacePicker";
import { PlaceRef, TourInput, destinationApi, landmarkApi, tourApi } from "@/lib/api";
import { TOUR_STATUS, todayIso } from "@/lib/tourFormat";

const BASE = "/dashboard/tours";

interface FormState {
  name: string;
  summary: string;
  itinerary: string;
  image: string;
  price: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  status: TourInput["status"];
}

const BLANK: FormState = { name: "", summary: "", itinerary: "", image: "", price: 0, durationDays: 1, startDate: todayIso(), endDate: todayIso(), maxParticipants: 20, status: "OPEN" };

const searchLandmarks = async (q: string): Promise<PlaceRef[]> =>
  (await landmarkApi.list({ q: q || undefined, status: "ACTIVE", page: 0, size: 20 })).items.map((l) => ({ id: l.id, name: l.name, address: l.address, image: l.urlImage }));
const searchDestinations = async (q: string): Promise<PlaceRef[]> =>
  (await destinationApi.list({ q: q || undefined, limit: 20 })).slice(0, 20).map((d) => ({ id: d.id, name: d.name, address: d.address, image: d.urlImage }));

/** Thêm/sửa tour, kèm chọn các di tích và địa điểm du lịch liên kết. Có id thì là sửa. */
export default function TourForm({ id }: { id?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = Boolean(id);

  const existing = useQuery({ queryKey: ["tour", id], queryFn: () => tourApi.get(id!), enabled: editing });
  const [form, setForm] = useState<FormState>(BLANK);
  const [landmarks, setLandmarks] = useState<PlaceRef[]>([]);
  const [destinations, setDestinations] = useState<PlaceRef[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = existing.data;
    if (!t) return;
    setForm({ name: t.name, summary: t.summary ?? "", itinerary: t.itinerary ?? "", image: t.image ?? "", price: t.price, durationDays: t.durationDays, startDate: t.startDate, endDate: t.endDate, maxParticipants: t.maxParticipants, status: t.status });
    setLandmarks(t.landmarks);
    setDestinations(t.destinations);
  }, [existing.data]);

  const save = useMutation({
    mutationFn: () =>
      tourApi.save(
        { ...form, name: form.name.trim(), landmarkIds: landmarks.map((p) => p.id), destinationIds: destinations.map((p) => p.id) },
        id
      ),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ["tours"] });
      qc.invalidateQueries({ queryKey: ["tour", saved.id] });
      router.push(`${BASE}/${saved.id}`);
    },
    onError: (e: Error) => setError(e.message),
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.endDate < form.startDate) {
      setError("Ngày kết thúc không được trước ngày khởi hành");
      return;
    }
    save.mutate();
  };

  if (editing && existing.isPending) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageTitle navHref={BASE} title={editing ? "Sửa tour" : "Thêm tour"} subtitle="Thông tin tour và các địa điểm tham quan" />
      <Card>
        <CardContent component="form" onSubmit={onSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {existing.error && <Alert severity="error" sx={{ mb: 2 }}>{(existing.error as Error).message}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Tên tour" value={form.name} onChange={(e) => set("name", e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Ảnh đại diện (URL)" value={form.image} onChange={(e) => set("image", e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Giá mỗi người (₫)" type="number" value={form.price} onChange={(e) => set("price", Math.max(0, Number(e.target.value)))} required fullWidth inputProps={{ min: 0, step: 10000 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Số chỗ tối đa" type="number" value={form.maxParticipants} onChange={(e) => set("maxParticipants", Math.max(1, Number(e.target.value)))} required fullWidth inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Ngày khởi hành" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Ngày kết thúc" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Số ngày" type="number" value={form.durationDays} onChange={(e) => set("durationDays", Math.max(1, Number(e.target.value)))} required fullWidth inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Trạng thái" value={form.status} onChange={(e) => set("status", e.target.value as FormState["status"])} fullWidth>
                {Object.entries(TOUR_STATUS).map(([value, s]) => (
                  <MenuItem key={value} value={value}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Giới thiệu ngắn" value={form.summary} onChange={(e) => set("summary", e.target.value)} multiline minRows={2} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Lịch trình" value={form.itinerary} onChange={(e) => set("itinerary", e.target.value)} multiline minRows={5} fullWidth placeholder={"Ngày 1: ...\nNgày 2: ..."} />
            </Grid>
            <Grid item xs={12}>
              <PlacePicker label="Di tích, danh lam thắng cảnh" value={landmarks} onChange={setLandmarks} search={searchLandmarks} />
            </Grid>
            <Grid item xs={12}>
              <PlacePicker label="Địa điểm du lịch" value={destinations} onChange={setDestinations} search={searchDestinations} />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button component={NextLink} href={editing ? `${BASE}/${id}` : BASE} startIcon={<ArrowBackIcon />}>
              Quay lại
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={save.isPending}>
              {save.isPending ? "Đang lưu..." : "Lưu tour"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
