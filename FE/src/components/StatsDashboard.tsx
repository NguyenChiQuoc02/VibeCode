"use client";

import { ReactNode, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Card, Grid, Skeleton, Stack, Tab, Tabs, Typography } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PlaceIcon from "@mui/icons-material/Place";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import GridViewIcon from "@mui/icons-material/GridView";
import InsightsIcon from "@mui/icons-material/Insights";
import ApexChart from "@/components/ApexChart";
import { statsApi, StatsChart } from "@/lib/api";

const PALETTE = ["#20A7C9", "#444E86", "#5AC189", "#FF7F44", "#666666", "#E04355", "#FCC700", "#A868B1"];

// Màu nền, màu icon của 5 thẻ số liệu, lấy theo thứ tự chart trên Superset.
const KPI_STYLES: { bg: string; border: string; icon: string; Icon: typeof AccountBalanceIcon }[] = [
  { bg: "linear-gradient(135deg, #F1F6FD 0%, #E6EFFB 100%)", border: "#D6E4F7", icon: "#2065D1", Icon: AccountBalanceIcon },
  { bg: "linear-gradient(135deg, #F0FAF5 0%, #E1F5EA 100%)", border: "#CDEBDA", icon: "#00A76F", Icon: PlaceIcon },
  { bg: "linear-gradient(135deg, #F6F3FD 0%, #ECE6FA 100%)", border: "#DDD3F5", icon: "#7A3EE6", Icon: EventIcon },
  { bg: "linear-gradient(135deg, #FFF8F0 0%, #FFEFDD 100%)", border: "#FBE1C3", icon: "#FF9F1C", Icon: GroupsIcon },
  { bg: "linear-gradient(135deg, #EFFAFB 0%, #DDF3F6 100%)", border: "#C6E8EE", icon: "#16A5B8", Icon: GridViewIcon },
];

const number = (v: number) => v.toLocaleString("vi-VN");

/** Nhãn dễ đọc hơn cho vài trường đặc thù (tháng, cờ nghỉ). */
function prettyLabels(c: StatsChart): string[] {
  if (/theo tháng/i.test(c.name)) return c.labels.map((l) => `T${l}`);
  if (c.labels.length > 0 && c.labels.every((l) => ["0", "1", "true", "false"].includes(l))) {
    return c.labels.map((l) => (l === "1" || l === "true" ? "Được nghỉ" : "Không nghỉ"));
  }
  return c.labels;
}

function Banner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card sx={{ position: "relative", overflow: "hidden", mb: 3, background: "linear-gradient(90deg, #F4FAFB 0%, #E6F4F6 60%, #D9EEF1 100%)" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 3, position: "relative", zIndex: 1 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: 3, display: "grid", placeItems: "center", color: "primary.main", bgcolor: "rgba(0,167,111,0.14)", "& svg": { fontSize: 30 } }}>
          <InsightsIcon />
        </Box>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Stack>
      <Box sx={{ position: "absolute", right: 0, top: 0, bottom: 0, width: { xs: 0, md: "46%" }, display: { xs: "none", md: "block" } }}>
        <Typography
          sx={{ position: "absolute", left: "6%", top: "50%", transform: "translateY(-50%)", fontFamily: "cursive", fontStyle: "italic", color: "#1C4E5B", fontSize: 18, lineHeight: 1.5, zIndex: 1 }}
        >
          “Kết nối di sản
          <br />
          &nbsp;&nbsp;Lan tỏa giá trị Việt”
        </Typography>
        <svg viewBox="0 0 400 120" preserveAspectRatio="xMaxYMax slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
          <path d="M0 120 L0 88 Q60 52 120 84 T230 70 T330 82 T400 64 L400 120 Z" fill="#BFE3DC" opacity="0.7" />
          <path d="M120 120 L120 96 Q190 70 250 94 T400 80 L400 120 Z" fill="#8FD0C0" opacity="0.8" />
          <path d="M250 120 L250 104 Q320 84 400 100 L400 120 Z" fill="#5BB89E" />
          <g fill="#8A5A44">
            <rect x="318" y="62" width="44" height="30" />
            <path d="M310 64 L340 44 L370 64 Z" />
            <path d="M322 46 L340 32 L358 46 Z" />
          </g>
          <g fill="#F1D9B8">
            <rect x="326" y="70" width="8" height="22" />
            <rect x="346" y="70" width="8" height="22" />
          </g>
        </svg>
      </Box>
    </Card>
  );
}

function KpiCard({ chart, index }: { chart: StatsChart; index: number }) {
  const s = KPI_STYLES[index % KPI_STYLES.length];
  return (
    <Card sx={{ p: 2.5, background: s.bg, border: `1px solid ${s.border}`, boxShadow: "none" }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "#fff", color: s.icon, boxShadow: "0 2px 8px rgba(145,158,171,0.2)", "& svg": { fontSize: 26 } }}>
          <s.Icon />
        </Box>
        <Typography variant="subtitle2" sx={{ lineHeight: 1.3 }}>
          {chart.name}
        </Typography>
      </Stack>
      <Typography variant="h3" sx={{ mt: 2, fontWeight: 700 }}>
        {number(chart.values[0] ?? 0)}
      </Typography>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card variant="outlined" sx={{ p: 2.5, height: "100%", boxShadow: "none" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Card>
  );
}

function DonutCard({ chart }: { chart: StatsChart }) {
  const labels = prettyLabels(chart);
  const total = chart.values.reduce((a, b) => a + b, 0);
  return (
    <ChartCard title={chart.name}>
      <ApexChart
        type="donut"
        height={260}
        series={chart.values}
        options={{
          labels,
          colors: PALETTE,
          legend: { show: false },
          stroke: { width: 2, colors: ["#fff"] },
          dataLabels: { enabled: true, dropShadow: { enabled: false }, formatter: (v: number) => (v >= 4 ? `${v.toFixed(1)}%` : "") },
          tooltip: { y: { formatter: (v: number) => number(v) } },
          plotOptions: { pie: { donut: { size: "70%", labels: { show: true, name: { show: false }, value: { fontSize: "22px", fontWeight: 700, formatter: (v: string) => number(Number(v)) }, total: { show: true, showAlways: true, label: "Tổng", formatter: () => number(total) } } } } },
        }}
      />
      <Stack spacing={1} sx={{ mt: 1 }}>
        {labels.map((l, i) => (
          <Stack key={l + i} direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 12, height: 12, borderRadius: "3px", flexShrink: 0, bgcolor: PALETTE[i % PALETTE.length] }} />
            <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }} noWrap title={l}>
              {l}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {total ? ((chart.values[i] / total) * 100).toFixed(1) : "0"}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  );
}

function BarCard({ chart }: { chart: StatsChart }) {
  const horizontal = chart.horizontal;
  return (
    <ChartCard title={chart.name}>
      <ApexChart
        type="bar"
        height={horizontal ? Math.max(260, chart.labels.length * 30 + 40) : 320}
        series={[{ name: "Số lượng", data: chart.values }]}
        options={{
          colors: ["#20A7C9"],
          legend: { show: false },
          xaxis: { categories: prettyLabels(chart), labels: { style: { fontSize: "12px" } } },
          yaxis: { labels: { formatter: (v: number) => (horizontal ? String(v) : number(Math.round(v))) } },
          dataLabels: { enabled: true, style: { fontSize: "11px" }, formatter: (v: number) => number(v), offsetX: horizontal ? 24 : 0, offsetY: horizontal ? 0 : -18 },
          plotOptions: { bar: { horizontal, borderRadius: 4, barHeight: "62%", columnWidth: "45%", dataLabels: { position: horizontal ? "center" : "top" } } },
          tooltip: { y: { formatter: (v: number) => number(v) } },
        }}
      />
    </ChartCard>
  );
}

export default function StatsDashboard({ title, subtitle }: { title: string; subtitle: string }) {
  const [tab, setTab] = useState(0);
  // Số liệu ít đổi: giữ trong cache 60 giây để chuyển trang qua lại không phải tải lại.
  const q = useQuery({ queryKey: ["stats", "dashboard"], queryFn: statsApi.dashboard, staleTime: 60_000 });

  const { kpis, tabs } = useMemo(() => {
    const all = q.data?.tabs ?? [];
    return {
      kpis: all.flatMap((t) => t.charts.filter((c) => c.type === "kpi")),
      tabs: all.map((t) => ({ title: t.title, charts: t.charts.filter((c) => c.type !== "kpi") })).filter((t) => t.charts.length > 0),
    };
  }, [q.data]);

  const active = tabs[Math.min(tab, Math.max(tabs.length - 1, 0))];

  return (
    <>
      <Banner title={title} subtitle={subtitle} />

      {q.error ? (
        <Alert severity="error">{(q.error as Error).message}</Alert>
      ) : (
        <>
          <Box sx={{ display: "grid", gap: 2.5, mb: 3, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" } }}>
            {q.isPending
              ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} variant="rounded" height={132} />)
              : kpis.map((c, i) => <KpiCard key={c.id} chart={c} index={i} />)}
          </Box>

          <Card sx={{ p: 0 }}>
            <Tabs value={Math.min(tab, Math.max(tabs.length - 1, 0))} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              {(q.isPending ? [] : tabs).map((t) => (
                <Tab key={t.title} label={t.title} sx={{ fontWeight: 600 }} />
              ))}
            </Tabs>
            <Box sx={{ p: 2.5 }}>
              {q.isPending || !active ? (
                <Grid container spacing={2.5}>
                  {[0, 1, 2].map((i) => (
                    <Grid item xs={12} md={6} lg={4} key={i}>
                      <Skeleton variant="rounded" height={420} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // Chỉ dựng biểu đồ của tab đang mở để trang tải nhanh.
                <Grid container spacing={2.5}>
                  {active.charts.map((c) => (
                    <Grid item xs={12} md={c.type === "bar" ? 12 : 6} lg={c.type === "bar" ? 12 : 4} key={c.id}>
                      {c.type === "pie" ? <DonutCard chart={c} /> : <BarCard chart={c} />}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Card>
        </>
      )}
    </>
  );
}
