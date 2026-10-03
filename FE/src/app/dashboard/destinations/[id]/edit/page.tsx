"use client";

import { useParams } from "next/navigation";
import CrudForm from "@/components/CrudForm";
import { Destination, destinationApi } from "@/lib/api";
import { useDestinationConfig } from "@/lib/crudConfigs";

export default function EditDestinationPage() {
  const { id } = useParams<{ id: string }>();
  const { fields, blank, ready } = useDestinationConfig();
  return <CrudForm<Destination> basePath="/dashboard/destinations" noun="địa điểm" queryKey="destinations" api={destinationApi} fields={fields} blank={blank} ready={ready} id={id} />;
}
