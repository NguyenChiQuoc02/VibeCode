"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { Skeleton, useTheme } from "@mui/material";

// ApexCharts dùng `window` nên chỉ render phía client.
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={300} />,
});

interface Props {
  type: "area" | "line" | "bar" | "pie" | "donut" | "radialBar" | "radar";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  series: any;
  options?: ApexOptions;
  height?: number | string;
}

export default function ApexChart({ type, series, options = {}, height = 320 }: Props) {
  const theme = useTheme();
  const base: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: theme.typography.fontFamily, zoom: { enabled: false } },
    colors: [theme.palette.primary.main, theme.palette.warning.main, theme.palette.info.main, theme.palette.error.main],
    grid: { strokeDashArray: 3, borderColor: theme.palette.divider },
    legend: { position: "top", horizontalAlign: "right", markers: { size: 6 }, fontWeight: 500 },
    stroke: { width: 2 },
    dataLabels: { enabled: false },
    tooltip: { theme: "light" },
  };
  const merged = { ...base, ...options, chart: { ...base.chart, ...options.chart } };
  return <ReactApexChart type={type} series={series} options={merged} height={height} />;
}
