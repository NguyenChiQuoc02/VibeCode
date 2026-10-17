"use client";

import { useParams } from "next/navigation";
import CrudDetail from "@/components/CrudDetail";
import { Car, carApi } from "@/lib/api";
import { CAR_FIELDS } from "@/lib/crudConfigs";

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <CrudDetail<Car> basePath="/dashboard/cars" menuLabel="Mẫu xe" queryKey="cars" api={carApi} fields={CAR_FIELDS} id={id} />;
}
