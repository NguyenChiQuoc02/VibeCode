"use client";

import CrudForm from "@/components/CrudForm";
import { CarBrand, carBrandApi } from "@/lib/api";
import { CAR_BRAND_BLANK, CAR_BRAND_FIELDS } from "@/lib/crudConfigs";

export default function NewCarBrandPage() {
  return <CrudForm<CarBrand> basePath="/dashboard/car-brands" noun="hãng xe" queryKey="car-brands" api={carBrandApi} fields={CAR_BRAND_FIELDS} blank={CAR_BRAND_BLANK} />;
}
