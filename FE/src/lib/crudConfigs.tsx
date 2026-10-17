import { useQuery } from "@tanstack/react-query";
import { Box, Chip } from "@mui/material";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { FieldDef } from "@/components/CrudPage";
import PreviewImage from "@/components/PreviewImage";
import MenuVisibleSwitch from "@/components/MenuVisibleSwitch";
import { Car, CarBrand, Destination, Holiday, MenuConfig, menuApi } from "@/lib/api";
import { ICON_OPTIONS } from "@/lib/navigation";
import { useProvinces } from "@/lib/useProvinces";

const CALENDARS = [
  { value: "SOLAR", label: "Dương lịch" },
  { value: "LUNAR", label: "Âm lịch" },
];
const CATEGORIES = [
  { value: "PUBLIC", label: "Nghỉ lễ chính thức" },
  { value: "TRADITIONAL", label: "Lễ truyền thống" },
  { value: "INTERNATIONAL", label: "Ngày kỷ niệm quốc tế" },
];

export const HOLIDAY_FIELDS: FieldDef<Holiday>[] = [
  { key: "name", label: "Tên ngày lễ", kind: "text", required: true, table: true },
  { key: "day", label: "Ngày", kind: "number", half: true, required: true, table: true },
  { key: "month", label: "Tháng", kind: "number", half: true, required: true, table: true },
  { key: "calendar", label: "Loại lịch", kind: "select", options: CALENDARS, half: true, required: true, table: true },
  { key: "category", label: "Phân loại", kind: "select", options: CATEGORIES, half: true, required: true, table: true },
  {
    key: "dayOff",
    label: "Được nghỉ làm",
    kind: "boolean",
    table: (r) => (r.dayOff ? <Chip size="small" color="success" label="Nghỉ" /> : <Chip size="small" label="Không" />),
  },
  { key: "description", label: "Mô tả", kind: "multiline" },
];

export const HOLIDAY_BLANK: Omit<Holiday, "id"> = { name: "", calendar: "SOLAR", day: 1, month: 1, category: "TRADITIONAL", dayOff: false, description: "" };

/** Trường của menu; cần danh sách nhóm để chọn "Thuộc nhóm" nên là hook. */
export function useMenuConfig() {
  const { data = [] } = useQuery({ queryKey: ["menus"], queryFn: () => menuApi.list() });
  // Nhóm menu là mục không có đường dẫn.
  const groups = data.filter((m) => !m.href);
  const parentOptions = [{ value: "", label: "— Menu gốc (không thuộc nhóm) —" }, ...groups.map((g) => ({ value: g.id, label: g.label }))];
  const parentLabel = (id?: string | null) => groups.find((g) => g.id === id)?.label;

  const fields: FieldDef<MenuConfig>[] = [
    { key: "order", label: "Thứ tự", kind: "number", half: true, required: true, table: true },
    { key: "label", label: "Tên menu", kind: "text", required: true, table: (r) => (r.parentId ? <Box sx={{ pl: 2.5 }}>└ {r.label}</Box> : <Box sx={{ fontWeight: r.href ? 400 : 700 }}>{r.label}</Box>) },
    {
      key: "href",
      label: "Đường dẫn (để trống nếu là nhóm menu)",
      kind: "text",
      table: (r) => r.href || <Chip size="small" color="info" label="Nhóm menu" />,
    },
    { key: "parentId", label: "Thuộc nhóm", kind: "select", options: parentOptions, half: true, table: (r) => parentLabel(r.parentId) ?? "–" },
    { key: "icon", label: "Icon", kind: "select", options: ICON_OPTIONS, half: true, required: true },
    { key: "visible", label: "Hiển thị", kind: "boolean", table: (r) => <MenuVisibleSwitch row={r} /> },
    { key: "adminOnly", label: "Chỉ quản trị viên", kind: "boolean", table: (r) => (r.adminOnly ? <Chip size="small" color="warning" label="ADMIN" /> : <Chip size="small" label="Mọi người" />) },
  ];
  const blank: Omit<MenuConfig, "id"> = { label: "", href: "/dashboard/", icon: "menu", order: 99, visible: true, adminOnly: false, parentId: "" };
  return { fields, blank };
}

export const DESTINATION_TYPES = [
  "Biển, đảo",
  "Núi, cao nguyên",
  "Thành phố, phố cổ",
  "Hang động",
  "Thác, hồ, sông",
  "Sinh thái, vườn quốc gia",
  "Văn hóa, tâm linh",
  "Bảo tàng, triển lãm",
  "Giải trí, công viên chủ đề",
  "Điểm ngắm cảnh",
  "Công viên, vườn hoa",
  "Nghỉ dưỡng, resort",
  "Điểm tham quan khác",
].map((c) => ({ value: c, label: c }));

/** Trường của địa điểm du lịch; cần danh sách tỉnh nên là hook. */
export function useDestinationConfig() {
  const { options, isPending } = useProvinces();

  const fields: FieldDef<Destination>[] = [
    {
      key: "urlImage",
      label: "Ảnh (URL)",
      kind: "text",
      table: (r) =>
        r.urlImage ? (
          <Box sx={{ width: 44, height: 44, borderRadius: 1.5, overflow: "hidden" }}>
            <PreviewImage src={r.urlImage} alt={r.name} />
          </Box>
        ) : (
          <Box sx={{ width: 44, height: 44, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: "rgba(0,167,111,0.12)", color: "primary.main" }}>
            <TravelExploreIcon fontSize="small" />
          </Box>
        ),
    },
    { key: "name", label: "Tên địa điểm", kind: "text", required: true, table: true },
    { key: "type", label: "Loại hình", kind: "select", options: DESTINATION_TYPES, required: true, table: true },
    { key: "provinceCode", label: "Tỉnh/Thành phố", kind: "select", options, required: true, table: true },
    { key: "address", label: "Địa chỉ", kind: "text", table: true },
    { key: "latitude", label: "Vĩ độ", kind: "number", half: true },
    { key: "longitude", label: "Kinh độ", kind: "number", half: true },
    { key: "bestSeason", label: "Thời điểm đẹp", kind: "text" },
    { key: "description", label: "Mô tả", kind: "multiline" },
  ];

  const blank: Omit<Destination, "id"> = {
    name: "",
    type: DESTINATION_TYPES[0].value,
    provinceCode: options[0]?.value as number,
    address: "",
    latitude: null,
    longitude: null,
    bestSeason: "",
    description: "",
    urlImage: "",
  };

  return { fields, blank, ready: !isPending };
}

// ---- Xe hơi ----

export const CAR_BODY_TYPES = ["Sedan", "SUV, Crossover", "Hatchback", "Minivan, MPV", "Bán tải", "Coupe", "Convertible", "Wagon", "Xe thể thao", "Xe điện", "Khác"].map((c) => ({ value: c, label: c }));
export const CAR_FUELS = ["Xăng", "Dầu", "Hybrid", "Điện"].map((c) => ({ value: c, label: c }));
export const CAR_TRANSMISSIONS = ["Tự động", "Số sàn"].map((c) => ({ value: c, label: c }));

function carThumb(url: string | undefined, name: string) {
  return url ? (
    <Box sx={{ width: 64, height: 44, borderRadius: 1.5, overflow: "hidden" }}>
      <PreviewImage src={url} alt={name} />
    </Box>
  ) : (
    <Box sx={{ width: 64, height: 44, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: "rgba(0,167,111,0.12)", color: "primary.main" }}>
      <DirectionsCarIcon fontSize="small" />
    </Box>
  );
}

export const CAR_FIELDS: FieldDef<Car>[] = [
  { key: "urlImage", label: "Ảnh (URL)", kind: "text", table: (r) => carThumb(r.urlImage, r.name) },
  { key: "name", label: "Tên xe", kind: "text", required: true, table: true },
  { key: "brand", label: "Hãng", kind: "text", required: true, half: true, table: true },
  { key: "model", label: "Dòng xe", kind: "text", half: true },
  { key: "bodyType", label: "Kiểu thân xe", kind: "select", options: CAR_BODY_TYPES, half: true, table: true },
  { key: "year", label: "Năm ra mắt", kind: "number", half: true, table: true },
  { key: "fuel", label: "Nhiên liệu", kind: "select", options: CAR_FUELS, half: true, table: true },
  { key: "transmission", label: "Hộp số", kind: "select", options: CAR_TRANSMISSIONS, half: true },
  { key: "seats", label: "Số chỗ", kind: "number", half: true },
  { key: "price", label: "Giá (đồng)", kind: "number", half: true, table: (r) => (r.price ? `${new Intl.NumberFormat("vi-VN").format(r.price)} ₫` : "–") },
  { key: "country", label: "Quốc gia", kind: "text", half: true },
  { key: "featured", label: "Xe nổi bật (hiện ở trang chủ)", kind: "boolean", table: (r) => (r.featured ? <Chip size="small" color="success" label="Nổi bật" /> : "–") },
  { key: "priceEstimated", label: "Giá là ước tính", kind: "boolean" },
  { key: "description", label: "Mô tả", kind: "multiline" },
];

export const CAR_BLANK: Omit<Car, "id"> = {
  name: "",
  brand: "",
  model: "",
  bodyType: "Sedan",
  country: "",
  year: new Date().getFullYear(),
  fuel: "Xăng",
  transmission: "Tự động",
  seats: 5,
  price: 0,
  priceEstimated: false,
  featured: false,
  description: "",
  urlImage: "",
};

export const CAR_BRAND_FIELDS: FieldDef<CarBrand>[] = [
  { key: "urlImage", label: "Ảnh (URL)", kind: "text", table: (r) => carThumb(r.urlImage, r.name) },
  { key: "name", label: "Tên hãng", kind: "text", required: true, table: true },
  { key: "country", label: "Quốc gia", kind: "text", table: true },
  { key: "carCount", label: "Số mẫu xe", kind: "number", half: true, table: true },
  { key: "description", label: "Mô tả", kind: "multiline" },
];

export const CAR_BRAND_BLANK: Omit<CarBrand, "id"> = { name: "", country: "", description: "", urlImage: "", carCount: 0 };
