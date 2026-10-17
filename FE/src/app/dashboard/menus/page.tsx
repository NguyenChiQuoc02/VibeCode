"use client";

import CrudPage from "@/components/CrudPage";
import { MenuConfig, menuApi } from "@/lib/api";
import { useMenuConfig } from "@/lib/crudConfigs";

export default function MenusPage() {
  const { fields } = useMenuConfig();
  return <CrudPage<MenuConfig> title="Cấu hình menu" noun="menu" basePath="/dashboard/menus" queryKey="menus" api={menuApi} fields={fields} />;
}
