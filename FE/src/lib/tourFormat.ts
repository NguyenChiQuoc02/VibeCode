import type { BookingStatus, PaymentStatus, Tour, TourStatus } from "@/lib/api";

/** 1500000 -> "1.500.000 ₫". */
export function formatVnd(n: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(n)} ₫`;
}

/** "2026-10-04" -> "04/10/2026". */
export function formatDate(iso?: string): string {
  if (!iso) return "–";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function formatDateTime(iso?: string): string {
  return iso ? new Date(iso).toLocaleString("vi-VN") : "–";
}

/** Ngày hôm nay dạng yyyy-MM-dd theo giờ máy người dùng. */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const TOUR_STATUS: Record<TourStatus, { label: string; color: "success" | "warning" | "error" }> = {
  OPEN: { label: "Đang mở", color: "success" },
  CLOSED: { label: "Đã đóng", color: "warning" },
  CANCELLED: { label: "Đã hủy", color: "error" },
};

export const BOOKING_STATUS: Record<BookingStatus, { label: string; color: "info" | "default" | "success" }> = {
  REGISTERED: { label: "Đã đăng ký", color: "info" },
  CANCELLED: { label: "Đã hủy", color: "default" },
  COMPLETED: { label: "Hoàn thành", color: "success" },
};

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; color: "warning" | "success" }> = {
  UNPAID: { label: "Chưa thanh toán", color: "warning" },
  PAID: { label: "Đã thu tiền mặt", color: "success" },
};

export const CASH_NOTE = "Thanh toán bằng tiền mặt sau khi kết thúc hành trình.";

/** Trạng thái hiển thị cho khách: gộp trạng thái tour với ngày tháng và số chỗ. */
export function tourAvailability(t: Pick<Tour, "status" | "startDate" | "endDate" | "maxParticipants" | "bookedSeats">): { open: boolean; label: string } {
  const today = todayIso();
  if (t.status === "CANCELLED") return { open: false, label: "Tour đã hủy" };
  if (t.endDate < today) return { open: false, label: "Tour đã kết thúc" };
  if (t.startDate < today) return { open: false, label: "Tour đã khởi hành" };
  if (t.status === "CLOSED") return { open: false, label: "Đã đóng đăng ký" };
  if (t.bookedSeats >= t.maxParticipants) return { open: false, label: "Hết chỗ" };
  return { open: true, label: `Còn ${t.maxParticipants - t.bookedSeats} chỗ` };
}
