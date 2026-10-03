"use client";

import CrudPage from "@/components/CrudPage";
import { Destination, destinationApi } from "@/lib/api";
import { useDestinationConfig } from "@/lib/crudConfigs";

export default function DestinationsPage() {
  const { fields, ready } = useDestinationConfig();
  return <CrudPage<Destination> title="Địa điểm du lịch" noun="địa điểm" basePath="/dashboard/destinations" queryKey="destinations" api={destinationApi} fields={fields} ready={ready} />;
}
