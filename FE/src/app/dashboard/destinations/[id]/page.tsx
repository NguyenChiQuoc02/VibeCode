"use client";

import dynamic from "next/dynamic";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { Box, Button, Card, CardContent, CardHeader, CircularProgress } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import CrudDetail from "@/components/CrudDetail";
import PreviewImage from "@/components/PreviewImage";
import { Destination, destinationApi } from "@/lib/api";
import { useDestinationConfig } from "@/lib/crudConfigs";

const MiniMap = dynamic(() => import("@/components/MiniMap"), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
      <CircularProgress size={24} />
    </Box>
  ),
});

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { fields, ready } = useDestinationConfig();
  if (!ready) return null;

  return (
    <CrudDetail<Destination>
      basePath="/dashboard/destinations"
      menuLabel="Địa điểm du lịch"
      queryKey="destinations"
      api={destinationApi}
      fields={fields.filter((f) => f.key !== "urlImage")}
      id={id}
      hero={(d) => (
        <Box sx={{ height: { xs: 220, md: 320 }, borderRadius: 2, overflow: "hidden", background: "linear-gradient(135deg, #5BE49B 0%, #007867 100%)", display: "grid", placeItems: "center" }}>
          {d.urlImage ? <PreviewImage src={d.urlImage} alt={d.name} caption={d.name} /> : <TravelExploreIcon sx={{ fontSize: 88, color: "rgba(255,255,255,0.5)" }} />}
        </Box>
      )}
      side={(d) => (
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardHeader title="Bản đồ vị trí" titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
          <CardContent sx={{ pt: 0 }}>
            <Box sx={{ height: 200, borderRadius: 2, overflow: "hidden" }}>
              <MiniMap lat={d.latitude} lng={d.longitude} />
            </Box>
            <Button
              component={NextLink}
              href={`/dashboard/map?province=${d.provinceCode}&lat=${d.latitude}&lng=${d.longitude}&destinations=1`}
              fullWidth
              variant="contained"
              startIcon={<MapIcon />}
              sx={{ mt: 2 }}
            >
              Xem trên bản đồ
            </Button>
          </CardContent>
        </Card>
      )}
    />
  );
}
