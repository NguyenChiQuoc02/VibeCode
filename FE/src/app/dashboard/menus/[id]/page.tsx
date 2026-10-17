"use client";

import { useParams } from "next/navigation";
import CrudDetail from "@/components/CrudDetail";
import { MenuConfig, menuApi } from "@/lib/api";
import { useMenuConfig } from "@/lib/crudConfigs";

export default function MenuDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { fields } = useMenuConfig();
  return <CrudDetail<MenuConfig> basePath="/dashboard/menus" menuLabel="Cấu hình menu" queryKey="menus" api={menuApi} fields={fields} id={id} />;
}
