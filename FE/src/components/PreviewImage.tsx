"use client";

import { useState } from "react";
import { Box, SxProps, Theme } from "@mui/material";
import ImageLightbox from "@/components/ImageLightbox";

interface Props {
  src: string;
  alt?: string;
  /** Kiểu của ảnh. Mặc định phủ kín khung chứa. */
  sx?: SxProps<Theme>;
  /** Chú thích hiện trong popup. */
  caption?: string;
}

/** Ảnh có thể bấm vào để mở popup xem lớn. Dùng cho ảnh đơn lẻ; bộ ảnh nhiều tấm dùng ImageLightbox trực tiếp. */
export default function PreviewImage({ src, alt = "", sx, caption }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Box
        component="img"
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: "zoom-in", ...(sx as object) }}
      />
      <ImageLightbox images={[src]} index={open ? 0 : null} onClose={() => setOpen(false)} caption={caption ?? alt} />
    </>
  );
}
