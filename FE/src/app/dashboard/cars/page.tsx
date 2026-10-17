"use client";

import CrudPage from "@/components/CrudPage";
import { Car, carApi } from "@/lib/api";
import { CAR_FIELDS } from "@/lib/crudConfigs";

export default function CarsPage() {
  return <CrudPage<Car> title="Mẫu xe hơi" noun="mẫu xe" basePath="/dashboard/cars" queryKey="cars" api={carApi} fields={CAR_FIELDS} />;
}
