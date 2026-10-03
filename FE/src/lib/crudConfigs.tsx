import { Box, Chip } from "@mui/material";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { FieldDef } from "@/components/CrudPage";
import PreviewImage from "@/components/PreviewImage";
import { Destination, Holiday } from "@/lib/api";
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
  { key: "day", label: "Ngày", kind: "number", half: true, table: true },
  { key: "month", label: "Tháng", kind: "number", half: true, table: true },
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
    latitude: 16,
    longitude: 106,
    bestSeason: "",
    description: "",
    urlImage: "",
  };

  return { fields, blank, ready: !isPending };
}
