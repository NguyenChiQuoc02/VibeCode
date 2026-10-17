"use client";

import CrudForm from "@/components/CrudForm";
import { Car, carApi } from "@/lib/api";
import { CAR_BLANK, CAR_FIELDS } from "@/lib/crudConfigs";

export default function NewCarPage() {
  return <CrudForm<Car> basePath="/dashboard/cars" noun="mẫu xe" queryKey="cars" api={carApi} fields={CAR_FIELDS} blank={CAR_BLANK} />;
}
