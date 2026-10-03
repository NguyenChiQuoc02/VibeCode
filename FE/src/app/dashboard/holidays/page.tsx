"use client";

import CrudPage from "@/components/CrudPage";
import { Holiday, holidayApi } from "@/lib/api";
import { HOLIDAY_FIELDS } from "@/lib/crudConfigs";

export default function HolidaysPage() {
  return <CrudPage<Holiday> title="Ngày lễ Việt Nam" noun="ngày lễ" basePath="/dashboard/holidays" queryKey="holidays" api={holidayApi} fields={HOLIDAY_FIELDS} />;
}
