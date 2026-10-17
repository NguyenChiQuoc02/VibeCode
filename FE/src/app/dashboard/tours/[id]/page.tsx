"use client";

import NextLink from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, Card, CardHeader, Chip, CircularProgress, Grid, Rating, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/EditOutlined";
import PageTitle from "@/components/PageTitle";
import BookingsTable from "@/components/tour/BookingsTable";
import PlaceList from "@/components/tour/PlaceList";
import { tourApi } from "@/lib/api";
import { TOUR_STATUS, formatDate, formatVnd } from "@/lib/tourFormat";

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography component="div" sx={{ fontWeight: 600 }}>
        {children}
      </Typography>
    </Grid>
  );
}

/** Chi tiết tour cho admin: thông tin, địa điểm liên kết và danh sách đăng ký của tour. */
export default function TourAdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tour, isPending, error } = useQuery({ queryKey: ["tour", id], queryFn: () => tourApi.get(id) });

  return (
    <>
      <PageTitle
        navHref="/dashboard/tours"
        title={tour?.name ?? "Chi tiết tour"}
        subtitle="Thông tin tour, địa điểm tham quan và danh sách đăng ký"
        action={
          <Stack direction="row" spacing={1}>
            <Button component={NextLink} href="/dashboard/tours" startIcon={<ArrowBackIcon />}>
              Danh sách
            </Button>
            <Button component={NextLink} href={`/dashboard/tours/${id}/edit`} variant="contained" startIcon={<EditIcon />}>
              Sửa
            </Button>
          </Stack>
        }
      />

      {isPending && (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{(error as Error).message}</Alert>}

      {tour && (
        <Stack spacing={3}>
          <Card>
            <CardHeader title="Thông tin" titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
            <Box sx={{ px: 3, pb: 3 }}>
              <Grid container spacing={2}>
                <Info label="Trạng thái">
                  <Chip size="small" color={TOUR_STATUS[tour.status].color} label={TOUR_STATUS[tour.status].label} />
                </Info>
                <Info label="Thời gian">
                  {formatDate(tour.startDate)} - {formatDate(tour.endDate)} ({tour.durationDays} ngày)
                </Info>
                <Info label="Giá mỗi người">{formatVnd(tour.price)}</Info>
                <Info label="Số chỗ">
                  {tour.bookedSeats} / {tour.maxParticipants}
                </Info>
                <Info label="Đánh giá">
                  {tour.reviewCount > 0 ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Rating value={tour.avgRating} precision={0.5} readOnly size="small" />
                      <span>
                        {tour.avgRating.toFixed(1)} ({tour.reviewCount})
                      </span>
                    </Stack>
                  ) : (
                    "Chưa có"
                  )}
                </Info>
                {tour.summary && <Info label="Giới thiệu">{tour.summary}</Info>}
                {tour.itinerary && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Lịch trình
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>{tour.itinerary}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Card>

          <Card>
            <CardHeader title="Địa điểm tham quan" titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
            <Box sx={{ px: 3, pb: 3 }}>
              {tour.landmarks.length + tour.destinations.length === 0 && <Typography color="text.secondary">Chưa liên kết địa điểm nào. Bấm Sửa để thêm.</Typography>}
              <Stack spacing={2}>
                <PlaceList title="Di tích, danh lam thắng cảnh" places={tour.landmarks} />
                <PlaceList title="Địa điểm du lịch" places={tour.destinations} />
              </Stack>
            </Box>
          </Card>

          <Card>
            <CardHeader title="Đăng ký tour" titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
            <BookingsTable tourId={id} />
          </Card>
        </Stack>
      )}
    </>
  );
}
