/** Ngôn ngữ thiết kế của khu vực người dùng (khác hẳn khu quản trị: ảnh lớn, chữ có chân, màu san hô làm điểm nhấn). */
export const SITE = {
  brand: "#0E7C5B",
  brandDark: "#0B3D35",
  teal: "#14B8A6",
  ocean: "#1AA6B7",
  coral: "#FF6B4A",
  sun: "#FFB020",
  sand: "#FFF8EE",
  mist: "#F1F8F6",
  ink: "#0B2B26",
  muted: "#5F7A74",
  line: "rgba(11,61,53,0.1)",
  // Không dùng Georgia: thiếu dấu chồng tiếng Việt nên chữ như "ề", "ế" bị vỡ.
  serif: '"Palatino Linotype", "Book Antiqua", Palatino, "Sitka Text", "Times New Roman", serif',
  gradientBrand: "linear-gradient(135deg, #0E7C5B 0%, #14B8A6 100%)",
  gradientCoral: "linear-gradient(135deg, #FF6B4A 0%, #FF9A5A 100%)",
  gradientSky: "linear-gradient(135deg, #BFE8D8 0%, #8FC7E8 100%)",
  shadow: "0 10px 30px rgba(11,61,53,0.12)",
  shadowHover: "0 20px 44px rgba(11,61,53,0.24)",
  radius: 24,
} as const;

/** Ảnh nền cho các trang (Wikimedia Commons). */
export const HERO_IMAGES = {
  halong: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/V%E1%BB%8Bnh_H%E1%BA%A1_Long_-_NKS.jpg/1920px-V%E1%BB%8Bnh_H%E1%BA%A1_Long_-_NKS.jpg",
  danang: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/B%E1%BB%9D_%C4%91%C3%B4ng_c%E1%BA%A7u_R%E1%BB%93ng.jpg/960px-B%E1%BB%9D_%C4%91%C3%B4ng_c%E1%BA%A7u_R%E1%BB%93ng.jpg",
  phuquoc: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Phu_Quoc%2C_Viet_Nam.jpg/960px-Phu_Quoc%2C_Viet_Nam.jpg",
  fansipan: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/C%C3%A1p-treo-fansipan-17.jpg/960px-C%C3%A1p-treo-fansipan-17.jpg",
  dalat: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Da_Lat_-_Viet_Nam.jpg/960px-Da_Lat_-_Viet_Nam.jpg",
} as const;
