import { Suspense } from "react";
import LandmarkList from "./LandmarkList";

export default function LandmarksPage() {
  // useSearchParams (từ ô tìm kiếm ở header) cần Suspense.
  return (
    <Suspense>
      <LandmarkList />
    </Suspense>
  );
}
