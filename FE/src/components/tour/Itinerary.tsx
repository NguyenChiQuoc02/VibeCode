"use client";

import { Box, Typography } from "@mui/material";
import { SITE } from "@/components/site/tokens";

/** Tách lịch trình dạng "Ngày 1: ..." thành từng bước; không đúng dạng thì hiện nguyên văn. */
function parse(text: string): { day: string; text: string }[] | null {
  const steps = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.match(/^Ngày\s*(\d+)\s*:\s*(.*)$/i))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ day: m[1], text: m[2] }));
  return steps.length > 0 ? steps : null;
}

/** Lịch trình theo dòng thời gian: mỗi ngày là một chấm tròn nối với nhau bằng đường kẻ. */
export default function Itinerary({ text }: { text: string }) {
  const steps = parse(text);
  if (!steps) {
    return <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.9, color: SITE.ink }}>{text}</Typography>;
  }
  return (
    <Box sx={{ position: "relative", pl: 0 }}>
      {steps.map((s, i) => (
        <Box key={s.day} sx={{ display: "flex", gap: 2.5, pb: i === steps.length - 1 ? 0 : 3, position: "relative" }}>
          {i < steps.length - 1 && <Box sx={{ position: "absolute", left: 21, top: 46, bottom: 0, width: 2, background: `repeating-linear-gradient(180deg, ${SITE.teal} 0 6px, transparent 6px 12px)`, opacity: 0.55 }} />}
          <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, background: SITE.gradientBrand, boxShadow: "0 6px 16px rgba(14,124,91,0.35)", fontFamily: SITE.serif, fontSize: 18 }}>{s.day}</Box>
          <Box sx={{ flexGrow: 1, p: 2, borderRadius: 3, bgcolor: "#fff", boxShadow: "0 4px 16px rgba(11,61,53,0.08)" }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: SITE.coral }}>Ngày {s.day}</Typography>
            <Typography sx={{ mt: 0.5, color: SITE.ink, lineHeight: 1.7 }}>{s.text}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
