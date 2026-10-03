"use client";

import { useRef, useState } from "react";
import { TileLayer } from "react-leaflet";
import { PROVIDERS } from "@/lib/map";

// Số ô lỗi liên tiếp (khi chưa tải được ô nào) để coi nguồn này không dùng được.
const MAX_ERRORS = 4;

/** Lớp ảnh nền, tự chuyển sang nguồn kế tiếp nếu nguồn hiện tại không tải được ô nào. */
export default function BaseTileLayer() {
  const [index, setIndex] = useState(0);
  const errors = useRef(0);
  const loaded = useRef(false);
  const provider = PROVIDERS[index];

  return (
    <TileLayer
      key={provider.name}
      url={provider.url}
      attribution={provider.attribution}
      maxZoom={19}
      eventHandlers={{
        tileload: () => {
          loaded.current = true;
        },
        tileerror: () => {
          if (loaded.current) return;
          errors.current += 1;
          if (errors.current >= MAX_ERRORS && index < PROVIDERS.length - 1) {
            errors.current = 0;
            setIndex(index + 1);
          }
        },
      }}
    />
  );
}
