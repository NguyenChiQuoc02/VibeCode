"use client";

import { useParams } from "next/navigation";
import TourForm from "@/components/tour/TourForm";

export default function EditTourPage() {
  const { id } = useParams<{ id: string }>();
  return <TourForm id={id} />;
}
