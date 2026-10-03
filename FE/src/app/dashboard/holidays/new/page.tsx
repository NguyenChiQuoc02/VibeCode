"use client";

import CrudForm from "@/components/CrudForm";
import { Holiday, holidayApi } from "@/lib/api";
import { HOLIDAY_BLANK, HOLIDAY_FIELDS } from "@/lib/crudConfigs";

export default function NewHolidayPage() {
  return <CrudForm<Holiday> basePath="/dashboard/holidays" noun="ngày lễ" queryKey="holidays" api={holidayApi} fields={HOLIDAY_FIELDS} blank={HOLIDAY_BLANK} />;
}
