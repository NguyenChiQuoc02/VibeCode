"use client";

import { Box, Stack, Typography } from "@mui/material";

/** Đường biểu đồ nhỏ hiển thị trong thẻ thống kê. */
export function Sparkline({ data, color, width = 96, height = 40 }: { data: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${(i * step).toFixed(1)},${(height - 4 - ((v - min) / range) * (height - 8)).toFixed(1)}`);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface Slice {
  label: string;
  value: number;
  color: string;
}

/** Biểu đồ tròn kèm chú thích. */
export function PieChart({ data, size = 220 }: { data: Slice[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2;
  let angle = -Math.PI / 2;
  const paths = data.map((d) => {
    const a = (d.value / total) * Math.PI * 2;
    const x1 = r + r * Math.cos(angle);
    const y1 = r + r * Math.sin(angle);
    angle += a;
    const x2 = r + r * Math.cos(angle);
    const y2 = r + r * Math.sin(angle);
    return { d: `M${r},${r} L${x1},${y1} A${r},${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x2},${y2} Z`, ...d };
  });
  return (
    <Stack alignItems="center" spacing={3}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Biểu đồ tròn">
        {paths.map((p) => (
          <path key={p.label} d={p.d} fill={p.color} stroke="#fff" strokeWidth={2} />
        ))}
      </svg>
      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" useFlexGap>
        {data.map((d) => (
          <Stack key={d.label} direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: d.color }} />
            <Typography variant="caption" color="text.secondary">
              {d.label} ({((d.value / total) * 100).toFixed(1)}%)
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

export interface BarSeries {
  name: string;
  color: string;
  values: number[];
}

/** Biểu đồ cột nhóm. */
export function BarChart({ labels, series, height = 260 }: { labels: string[]; series: BarSeries[]; height?: number }) {
  const max = Math.max(...series.flatMap((s) => s.values));
  const top = Math.ceil(max / 20) * 20;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(top * t));
  return (
    <Box>
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 1 }}>
        {series.map((s) => (
          <Stack key={s.name} direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: s.color }} />
            <Typography variant="caption" color="text.secondary">
              {s.name}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Box sx={{ position: "relative", height, pl: 4 }}>
        {ticks.map((t) => (
          <Box
            key={t}
            sx={{ position: "absolute", left: 0, right: 0, bottom: `${(t / top) * 100}%`, borderTop: "1px dashed", borderColor: "divider" }}
          >
            <Typography variant="caption" color="text.disabled" sx={{ position: "absolute", top: -9, left: 0 }}>
              {t}
            </Typography>
          </Box>
        ))}
        <Stack direction="row" alignItems="flex-end" justifyContent="space-around" sx={{ position: "absolute", inset: 0, left: 32 }}>
          {labels.map((label, i) => (
            <Stack key={label} direction="row" alignItems="flex-end" spacing={0.5} sx={{ height: "100%" }}>
              {series.map((s) => (
                <Box
                  key={s.name}
                  sx={{ width: { xs: 6, sm: 10 }, height: `${(s.values[i] / top) * 100}%`, bgcolor: s.color, borderRadius: "4px 4px 0 0" }}
                />
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>
      <Stack direction="row" justifyContent="space-around" sx={{ pl: 4, mt: 1 }}>
        {labels.map((l) => (
          <Typography key={l} variant="caption" color="text.secondary">
            {l}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}
