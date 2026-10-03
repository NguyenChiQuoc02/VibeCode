"use client";

import PageTitle from "@/components/PageTitle";
import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MailIcon from "@mui/icons-material/Mail";
import StatCard from "@/components/StatCard";
import ApexChart from "@/components/ApexChart";
import { useAuth } from "@/context/AuthContext";

// Số liệu minh họa, chưa nối với business-service.
const STATS = [
  { title: "Doanh số tuần", value: "714k", percent: 2.6, tone: "blue" as const, icon: <ShoppingBagIcon />, chart: [22, 8, 35, 50, 82, 84, 77, 12, 87, 43] },
  { title: "Người dùng mới", value: "1.35m", percent: -0.1, tone: "purple" as const, icon: <PersonIcon />, chart: [56, 47, 40, 62, 73, 30, 23, 54, 67, 68] },
  { title: "Đơn đặt hàng", value: "1.72m", percent: 2.8, tone: "yellow" as const, icon: <ShoppingCartIcon />, chart: [40, 70, 75, 70, 50, 28, 7, 64, 38, 27] },
  { title: "Tin nhắn", value: "234", percent: 3.6, tone: "red" as const, icon: <MailIcon />, chart: [56, 30, 23, 54, 47, 40, 62, 73, 67, 68] },
];

const MONTHS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <PageTitle title={`Xin chào, ${user?.fullName ?? ""} 👋`} />

      <Grid container spacing={3}>
        {STATS.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <StatCard {...s} />
          </Grid>
        ))}

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Lượt truy cập hiện tại" />
            <CardContent>
              <ApexChart
                type="donut"
                series={[43.8, 31.3, 18.8, 6.3]}
                options={{
                  labels: ["Châu Mỹ", "Châu Á", "Châu Âu", "Châu Phi"],
                  colors: ["#1877F2", "#FFD666", "#006C9C", "#FF5630"],
                  legend: { position: "bottom", horizontalAlign: "center" },
                  stroke: { width: 2, colors: ["#fff"] },
                  plotOptions: { pie: { donut: { size: "72%", labels: { show: true, total: { show: true, label: "Tổng", formatter: () => "100%" } } } } },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={8}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Lượt truy cập website" subheader="(+43%) so với năm ngoái" />
            <CardContent>
              <ApexChart
                type="bar"
                series={[
                  { name: "Nhóm A", data: [43, 33, 22, 37, 67, 68, 37, 24, 55, 41, 52, 60] },
                  { name: "Nhóm B", data: [51, 70, 47, 67, 40, 37, 24, 70, 24, 33, 45, 58] },
                ]}
                options={{
                  colors: ["#3366FF", "#FFAB00"],
                  xaxis: { categories: MONTHS },
                  plotOptions: { bar: { columnWidth: "40%", borderRadius: 4 } },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader title="Doanh thu theo tháng" subheader="Đơn vị: triệu đồng" />
            <CardContent>
              <ApexChart
                type="area"
                series={[
                  { name: "Năm nay", data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 120, 132, 160] },
                  { name: "Năm ngoái", data: [20, 30, 25, 40, 39, 52, 59, 71, 98, 90, 100, 115] },
                ]}
                options={{
                  colors: ["#00A76F", "#8E33FF"],
                  xaxis: { categories: MONTHS },
                  stroke: { curve: "smooth", width: 3 },
                  fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 95, 100] } },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Tiến độ mục tiêu" />
            <CardContent>
              <ApexChart
                type="radialBar"
                series={[76, 62, 48]}
                options={{
                  labels: ["Doanh số", "Khách hàng", "Đơn hàng"],
                  colors: ["#00A76F", "#00B8D9", "#FFAB00"],
                  plotOptions: {
                    radialBar: {
                      hollow: { size: "40%" },
                      track: { background: "#F4F6F8" },
                      dataLabels: { total: { show: true, label: "Trung bình", formatter: () => "62%" } },
                    },
                  },
                  legend: { position: "bottom", horizontalAlign: "center" },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Sản phẩm bán chạy" subheader="Top 6 theo số lượng" />
            <CardContent>
              <ApexChart
                type="bar"
                height={300}
                series={[{ name: "Đã bán", data: [1380, 1200, 1100, 690, 580, 540] }]}
                options={{
                  colors: ["#00B8D9"],
                  plotOptions: { bar: { horizontal: true, barHeight: "50%", borderRadius: 4 } },
                  xaxis: { categories: ["Áo thun", "Giày thể thao", "Balo", "Đồng hồ", "Kính mát", "Mũ lưỡi trai"] },
                  legend: { show: false },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
