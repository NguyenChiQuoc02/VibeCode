"use client";

import CrudForm from "@/components/CrudForm";
import { Destination, destinationApi } from "@/lib/api";
import { useDestinationConfig } from "@/lib/crudConfigs";

export default function NewDestinationPage() {
  const { fields, blank, ready } = useDestinationConfig();
  return <CrudForm<Destination> basePath="/dashboard/destinations" noun="địa điểm" queryKey="destinations" api={destinationApi} fields={fields} blank={blank} ready={ready} />;
}
