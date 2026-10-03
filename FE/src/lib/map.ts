// Các nguồn ảnh nền bản đồ miễn phí, không cần khóa API, theo thứ tự thử. Nếu nguồn đầu không tải được
// (mạng chặn, máy chủ lỗi) bản đồ tự chuyển sang nguồn kế tiếp, xem BaseTileLayer.
// Nguồn đầu giống dự án LearnEnglish (máy chủ con a/b/c.tile.openstreetmap.org, maxZoom 19).
// Lưu ý: CARTO đã yêu cầu khóa API cho các ô raster nên không dùng.
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export interface TileProvider {
  name: string;
  url: string;
  attribution: string;
}

export const TILE_PROVIDERS: TileProvider[] = [
  { name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: OSM_ATTR },
  { name: "OpenStreetMap France", url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", attribution: `${OSM_ATTR}, tiles by <a href="https://www.openstreetmap.fr">OSM France</a>` },
  {
    name: "Esri",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
];

// Đặt NEXT_PUBLIC_MAP_TILE_URL để dùng nguồn riêng (vd nhà cung cấp tile có khóa), nguồn này được thử đầu tiên.
const custom = process.env.NEXT_PUBLIC_MAP_TILE_URL;
export const PROVIDERS: TileProvider[] = custom ? [{ name: "Tùy chỉnh", url: custom, attribution: OSM_ATTR }, ...TILE_PROVIDERS] : TILE_PROVIDERS;
