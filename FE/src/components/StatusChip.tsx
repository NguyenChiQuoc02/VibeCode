import { Chip } from "@mui/material";
import { LandmarkStatus } from "@/lib/api";
import { LANDMARK_STATUS } from "@/lib/landmark";

export default function StatusChip({ status }: { status: LandmarkStatus }) {
  const s = LANDMARK_STATUS[status] ?? LANDMARK_STATUS.ACTIVE;
  return <Chip size="small" label={s.label} sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, fontSize: 12, height: 24 }} />;
}
