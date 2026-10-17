import { Suspense } from "react";
import CatalogView from "./CatalogView";

export default function CatalogPage() {
  // useSearchParams cần Suspense.
  return (
    <Suspense>
      <CatalogView />
    </Suspense>
  );
}
