"use client";

import { useParams } from "next/navigation";
import CrudDetail from "@/components/CrudDetail";
import { CarBrand, carBrandApi } from "@/lib/api";
import { CAR_BRAND_FIELDS } from "@/lib/crudConfigs";

export default function CarBrandDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <CrudDetail<CarBrand> basePath="/dashboard/car-brands" menuLabel="Hãng xe" queryKey="car-brands" api={carBrandApi} fields={CAR_BRAND_FIELDS} id={id} />;
}
