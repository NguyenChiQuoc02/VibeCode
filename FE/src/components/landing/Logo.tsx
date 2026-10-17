import { Box, Stack, Typography } from "@mui/material";

/** Biểu tượng hai ngọn núi của VietJourney. */
export function MountainMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 40) / 48} viewBox="0 0 48 40" aria-hidden>
      <polygon points="14,40 30,12 48,40" fill="#19B386" />
      <polygon points="0,40 18,6 36,40" fill="#0B5E50" />
      <polygon points="18,6 24,17 12,17" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <MountainMark />
      <Box sx={{ lineHeight: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 20, color: "#0B3D35", letterSpacing: -0.3, lineHeight: 1.1 }}>VietJourney</Typography>
        <Typography sx={{ fontSize: 9, color: "#637381", lineHeight: 1.2 }}>Khám phá Việt Nam</Typography>
      </Box>
    </Stack>
  );
}
