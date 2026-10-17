"use client";

import { useQueries } from "@tanstack/react-query";
import { Destination, Landmark, destinationApi, landmarkApi } from "@/lib/api";
import { useProvinces } from "@/lib/useProvinces";

export type Tone = "teal" | "coral" | "amber" | "green" | "purple";

export interface PlaceCard {
  /** Id bản ghi. */
  key: string;
  kind: "LANDMARK" | "DESTINATION";
  title: string;
  province: string;
  description: string;
  image?: string;
  badge: string;
  tone: Tone;
  rating?: number;
  reviews?: string;
}

interface Spec {
  /** Tên bản ghi trong cơ sở dữ liệu, dùng để tìm. */
  name: string;
  /** Tên hiển thị nếu khác tên trong dữ liệu. */
  title?: string;
  badge: string;
  tone: Tone;
  /** Điểm đánh giá theo thiết kế. Hệ thống chưa có dữ liệu đánh giá nên đây là số mẫu, không có thì ẩn dòng này. */
  rating?: number;
  reviews?: string;
  /** Ảnh thay cho ảnh trong dữ liệu khi ảnh đó không đúng địa danh. */
  image?: string;
}

export const LANDMARK_SPECS: Spec[] = [
  { name: "Vịnh Hạ Long", badge: "Di sản thiên nhiên thế giới", tone: "teal", rating: 4.8, reviews: "12.5k" },
  { name: "Cố đô Huế", title: "Quần thể di tích Cố đô Huế", badge: "Di sản văn hóa thế giới", tone: "coral", rating: 4.7, reviews: "9.8k" },
  { name: "Thánh địa Mỹ Sơn", badge: "Di sản văn hóa thế giới", tone: "amber", rating: 4.6, reviews: "7.4k" },
  {
    name: "Thị trấn Sa Pa và núi Fansipan",
    title: "Fansipan",
    badge: "Danh thắng nổi tiếng",
    tone: "green",
    rating: 4.9,
    reviews: "15.2k",
    // Ảnh trong dữ liệu là thác Bạc, dùng ảnh cáp treo Fansipan (Wikimedia Commons) cho đúng địa danh.
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/C%C3%A1p-treo-fansipan-17.jpg/960px-C%C3%A1p-treo-fansipan-17.jpg",
  },
  { name: "Phong Nha", badge: "Di sản thiên nhiên thế giới", tone: "teal" },
  { name: "Hoàng thành Thăng Long", badge: "Di sản văn hóa thế giới", tone: "coral" },
  { name: "Tràng An", title: "Quần thể danh thắng Tràng An", badge: "Di sản thế giới", tone: "green" },
  { name: "Phố cổ Hội An", badge: "Di sản văn hóa thế giới", tone: "amber" },
];

export const DESTINATION_SPECS: Spec[] = [
  { name: "Phú Quốc", title: "Đảo Phú Quốc", badge: "Biển đảo", tone: "teal", rating: 4.7, reviews: "11.3k" },
  { name: "Hội An", badge: "Phố cổ", tone: "amber", rating: 4.8, reviews: "14.6k" },
  {
    name: "Sa Pa",
    title: "Sapa",
    badge: "Vùng núi",
    tone: "green",
    rating: 4.6,
    reviews: "9.1k",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Nh%C3%A0_th%E1%BB%9D_%C4%91%C3%A1_t%E1%BA%A1i_trung_t%C3%A2m_Sa_Pa.jpg/960px-Nh%C3%A0_th%E1%BB%9D_%C4%91%C3%A1_t%E1%BA%A1i_trung_t%C3%A2m_Sa_Pa.jpg",
  },
  { name: "Đà Nẵng", badge: "Thành phố", tone: "purple", rating: 4.7, reviews: "13.8k" },
  { name: "Đà Lạt", badge: "Vùng núi", tone: "green" },
  { name: "Hạ Long", badge: "Biển đảo", tone: "teal" },
  { name: "Mũi Né", badge: "Biển đảo", tone: "teal" },
  { name: "Côn Đảo", badge: "Biển đảo", tone: "teal" },
];

type Found = Pick<Landmark | Destination, "id" | "name" | "provinceCode" | "description" | "urlImage">;

/** Chọn bản ghi khớp tên chính xác, ưu tiên bản có ảnh. */
function pick<T extends Found>(items: T[], name: string): T | undefined {
  // Khớp đúng chữ hoa/thường trước (dữ liệu có cả bản nhập tay viết thường), rồi mới tới khớp không phân biệt hoa thường.
  const exact = items.filter((i) => i.name === name);
  const loose = items.filter((i) => i.name.toLowerCase() === name.toLowerCase());
  return exact.find((i) => i.urlImage) ?? loose.find((i) => i.urlImage) ?? items.find((i) => i.urlImage) ?? exact[0] ?? loose[0] ?? items[0];
}

/** "Thành phố Đà Nẵng" -> "Đà Nẵng", "Tỉnh Lào Cai" -> "Lào Cai". */
function shortProvince(name?: string): string {
  return (name ?? "").replace(/^(Tỉnh|Thành phố)\s+/, "");
}

/** Ảnh thumbnail Wikimedia có thể xin bản lớn hơn bằng cách đổi bề rộng trong đường dẫn. */
export function largeImage(url: string | undefined, width = 1920): string | undefined {
  return url?.replace(/\/\d+px-/, `/${width}px-`);
}

function toCard(kind: PlaceCard["kind"], spec: Spec, found: Found | undefined, province: string): PlaceCard | null {
  if (!found) return null;
  return {
    key: found.id,
    kind,
    title: spec.title ?? found.name,
    province,
    description: found.description ?? "",
    image: spec.image ?? (found.urlImage || undefined),
    badge: spec.badge,
    tone: spec.tone,
    rating: spec.rating,
    reviews: spec.reviews,
  };
}

/** Lấy dữ liệu thật từ business-service cho các địa danh và điểm đến nổi bật. */
export function useFeatured() {
  const { provinces } = useProvinces();
  const provinceName = (code: number) => shortProvince(provinces.find((p) => p.code === code)?.name);

  const landmarkQueries = useQueries({
    queries: LANDMARK_SPECS.map((s) => ({
      queryKey: ["landing", "landmark", s.name],
      queryFn: async () => pick((await landmarkApi.list({ q: s.name, status: "ACTIVE", page: 0, size: 10 })).items, s.name) ?? null,
      staleTime: 5 * 60_000,
    })),
  });
  const destinationQueries = useQueries({
    queries: DESTINATION_SPECS.map((s) => ({
      queryKey: ["landing", "destination", s.name],
      queryFn: async () => pick(await destinationApi.list({ q: s.name }), s.name) ?? null,
      staleTime: 5 * 60_000,
    })),
  });

  const landmarks = LANDMARK_SPECS.map((s, i) => {
    const f = landmarkQueries[i].data ?? undefined;
    return toCard("LANDMARK", s, f, provinceName(f?.provinceCode ?? -1));
  }).filter((c): c is PlaceCard => c !== null);
  const destinations = DESTINATION_SPECS.map((s, i) => {
    const f = destinationQueries[i].data ?? undefined;
    return toCard("DESTINATION", s, f, provinceName(f?.provinceCode ?? -1));
  }).filter((c): c is PlaceCard => c !== null);

  return { landmarks, destinations };
}
