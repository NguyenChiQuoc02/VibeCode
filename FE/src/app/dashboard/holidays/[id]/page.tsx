"use client";

import { useParams } from "next/navigation";
import CrudDetail from "@/components/CrudDetail";
import { Holiday, holidayApi } from "@/lib/api";
import { HOLIDAY_FIELDS } from "@/lib/crudConfigs";

export default function HolidayDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <CrudDetail<Holiday> basePath="/dashboard/holidays" menuLabel="Ngày lễ" queryKey="holidays" api={holidayApi} fields={HOLIDAY_FIELDS} id={id} />;
}
