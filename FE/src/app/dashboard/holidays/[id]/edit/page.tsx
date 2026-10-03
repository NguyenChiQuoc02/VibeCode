"use client";

import { useParams } from "next/navigation";
import CrudForm from "@/components/CrudForm";
import { Holiday, holidayApi } from "@/lib/api";
import { HOLIDAY_BLANK, HOLIDAY_FIELDS } from "@/lib/crudConfigs";

export default function EditHolidayPage() {
  const { id } = useParams<{ id: string }>();
  return <CrudForm<Holiday> basePath="/dashboard/holidays" noun="ngày lễ" queryKey="holidays" api={holidayApi} fields={HOLIDAY_FIELDS} blank={HOLIDAY_BLANK} id={id} />;
}
