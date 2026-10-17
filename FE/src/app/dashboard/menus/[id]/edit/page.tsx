"use client";

import { useParams } from "next/navigation";
import CrudForm from "@/components/CrudForm";
import { MenuConfig, menuApi } from "@/lib/api";
import { useMenuConfig } from "@/lib/crudConfigs";

export default function EditMenuPage() {
  const { id } = useParams<{ id: string }>();
  const { fields, blank } = useMenuConfig();
  return <CrudForm<MenuConfig> basePath="/dashboard/menus" noun="menu" queryKey="menus" api={menuApi} fields={fields} blank={blank} id={id} />;
}
