"use client";

import { ReactNode } from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { Sparkline } from "./charts";

export type Tone = "blue" | "purple" | "yellow" | "red";

const TONES: Record<Tone, { bg: string; text: string; line: string; icon: string }> = {
  blue: { bg: "linear-gradient(135deg, #D1E9FC 0%, #76B0F1 100%)", text: "#061B64", line: "#103996", icon: "#2065D1" },
  purple: { bg: "linear-gradient(135deg, #EFD6FF 0%, #C684FF 100%)", text: "#27097A", line: "#5119B7", icon: "#7A3EE6" },
  yellow: { bg: "linear-gradient(135deg, #FFF5CC 0%, #FFD666 100%)", text: "#7A4100", line: "#B76E00", icon: "#FFAB00" },
  red: { bg: "linear-gradient(135deg, #FFE9D5 0%, #FFAC82 100%)", text: "#7A0916", line: "#B71D18", icon: "#FF5630" },
};

interface Props {
  title: string;
  value: string;
  percent: number;
  tone: Tone;
  icon: ReactNode;
  chart: number[];
}

export default function StatCard({ title, value, percent, tone, icon, chart }: Props) {
  const t = TONES[tone];
  const up = percent >= 0;
  return (
    <Card sx={{ p: 3, background: t.bg, color: t.text, boxShadow: "none", position: "relative", overflow: "hidden" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ color: t.icon, display: "flex", "& svg": { fontSize: 48 } }}>{icon}</Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {up ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
          <Typography variant="subtitle2">
            {up ? "+" : ""}
            {percent}%
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 3 }}>
        <Box>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>
            {value}
          </Typography>
        </Box>
        <Sparkline data={chart} color={t.line} />
      </Stack>
    </Card>
  );
}
