import { useQuery } from "@tanstack/react-query";
import { geoApi } from "@/lib/api";

/** Danh sách tỉnh/thành (không kèm polygon), dùng cho ô chọn tỉnh và hiển thị tên tỉnh. */
export function useProvinces() {
  const { data = [], isPending } = useQuery({ queryKey: ["provinces"], queryFn: () => geoApi.provinces(false), staleTime: Infinity });
  const options = data.map((p) => ({ value: p.code, label: p.name }));
  return { provinces: data, options, isPending };
}
