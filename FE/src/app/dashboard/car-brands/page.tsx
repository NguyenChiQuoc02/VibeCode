"use client";

import CrudPage from "@/components/CrudPage";
import { CarBrand, carBrandApi } from "@/lib/api";
import { CAR_BRAND_FIELDS } from "@/lib/crudConfigs";

export default function CarBrandsPage() {
  return <CrudPage<CarBrand> title="Hãng xe" noun="hãng xe" basePath="/dashboard/car-brands" queryKey="car-brands" api={carBrandApi} fields={CAR_BRAND_FIELDS} />;
}
