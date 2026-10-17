import type { Car, TestDriveStatus } from "@/lib/api";

export const TEST_DRIVE_STATUS: Record<TestDriveStatus, { label: string; color: "warning" | "info" | "success" | "default" }> = {
  PENDING: { label: "Chờ xác nhận", color: "warning" },
  CONFIRMED: { label: "Đã xác nhận", color: "info" },
  COMPLETED: { label: "Đã lái thử", color: "success" },
  CANCELLED: { label: "Đã hủy", color: "default" },
};

/** "2499000000" -> "2.499.000.000 đ"; giá ước tính có dấu "~" ở ngoài giao diện. */
export function formatCarPrice(n?: number | null): string {
  return n ? `${new Intl.NumberFormat("vi-VN").format(n)} đ` : "Liên hệ";
}

/** Tạo ảnh thu nhỏ từ liên kết Wikimedia Commons (đổi tham số width). */
export function carImage(c: Pick<Car, "urlImage">, width = 800): string {
  return c.urlImage ? c.urlImage.replace(/width=\d+/, `width=${width}`) : "";
}
