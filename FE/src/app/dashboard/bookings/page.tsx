"use client";

import { Card, CardHeader } from "@mui/material";
import PageTitle from "@/components/PageTitle";
import BookingsTable from "@/components/tour/BookingsTable";

/** Tất cả đăng ký tour (admin). */
export default function BookingsPage() {
  return (
    <>
      <PageTitle />
      <Card>
        <CardHeader title="Danh sách đăng ký" titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
        <BookingsTable />
      </Card>
    </>
  );
}
