import { LandmarkStatus } from "@/lib/api";

export const LANDMARK_STATUS: Record<LandmarkStatus, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: "Đang hoạt động", color: "#118D57", bg: "rgba(34,197,94,0.16)" },
  PAUSED: { label: "Tạm ngừng", color: "#B76E00", bg: "rgba(255,171,0,0.16)" },
  DELETED: { label: "Đã xóa", color: "#B71D18", bg: "rgba(255,86,48,0.16)" },
};

export const LANDMARK_CATEGORIES = ["Di sản thế giới", "Di tích quốc gia đặc biệt", "Di tích lịch sử", "Di tích văn hóa, kiến trúc", "Danh lam thắng cảnh"];

export const RECOGNITION_LEVELS = ["Quốc tế", "Quốc gia đặc biệt", "Quốc gia", "Tỉnh/Thành phố"];
