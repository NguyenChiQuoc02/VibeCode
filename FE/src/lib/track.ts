import { recommendApi, RecommendEvent } from "@/lib/api";

const SESSION_KEY = "vibecode_session";

/** Mã phiên ẩn danh để gom sự kiện của một lượt truy cập; không chứa thông tin cá nhân. */
function sessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

let last = { key: "", at: 0 };

/** Ghi sự kiện hành vi cho hệ thống gợi ý. Không chặn giao diện và bỏ qua mọi lỗi (gợi ý là tính năng phụ). */
export function trackEvent(event: RecommendEvent): void {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_RECOMMEND_API) return;
  // Bỏ sự kiện giống hệt vừa gửi trong 2 giây (effect chạy hai lần ở chế độ dev, bấm đúp...).
  const key = JSON.stringify(event);
  if (key === last.key && Date.now() - last.at < 2000) return;
  last = { key, at: Date.now() };
  recommendApi.track({ ...event, sessionId: sessionId() }).catch(() => undefined);
}
