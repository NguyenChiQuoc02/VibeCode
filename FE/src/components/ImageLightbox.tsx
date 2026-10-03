"use client";

import { useCallback, useEffect } from "react";
import { Box, Dialog, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface Props {
  /** Danh sách ảnh để lật qua lại. */
  images: string[];
  /** Vị trí ảnh đang xem; null là đóng popup. */
  index: number | null;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  /** Chú thích dưới ảnh (thường là tên địa danh). */
  caption?: string;
}

/** Popup xem ảnh cỡ lớn. Có mũi tên và phím ←/→ khi có nhiều ảnh, Esc hoặc bấm nền để đóng. */
export default function ImageLightbox({ images, index, onClose, onIndexChange, caption }: Props) {
  const open = index !== null && images.length > 0;
  const count = images.length;

  const move = useCallback(
    (step: number) => {
      if (index === null || count < 2) return;
      onIndexChange?.((index + step + count) % count);
    },
    [index, count, onIndexChange]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, move]);

  const arrow = (side: "left" | "right") => (
    <IconButton
      aria-label={side === "left" ? "Ảnh trước" : "Ảnh sau"}
      onClick={(e) => {
        e.stopPropagation();
        move(side === "left" ? -1 : 1);
      }}
      sx={{ position: "absolute", top: "50%", [side]: 12, transform: "translateY(-50%)", color: "#fff", bgcolor: "rgba(0,0,0,0.45)", "&:hover": { bgcolor: "rgba(0,0,0,0.65)" } }}
    >
      {side === "left" ? <ChevronLeftIcon fontSize="large" /> : <ChevronRightIcon fontSize="large" />}
    </IconButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none", overflow: "visible", m: 2 } }}
      slotProps={{ backdrop: { sx: { bgcolor: "rgba(0,0,0,0.85)" } } }}
    >
      {open && (
        <Box onClick={onClose} sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: { xs: "80vw", md: 360 } }}>
          <IconButton aria-label="Đóng" onClick={onClose} sx={{ position: "fixed", top: 16, right: 16, color: "#fff", bgcolor: "rgba(0,0,0,0.45)", "&:hover": { bgcolor: "rgba(0,0,0,0.65)" } }}>
            <CloseIcon />
          </IconButton>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index!]}
            alt={caption ?? ""}
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "82vh", objectFit: "contain", borderRadius: 8, background: "#111" }}
          />
          {(caption || count > 1) && (
            <Typography variant="body2" sx={{ color: "#fff", mt: 1.5, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
              {caption}
              {caption && count > 1 ? " · " : ""}
              {count > 1 ? `${index! + 1}/${count}` : ""}
            </Typography>
          )}
          {count > 1 && (
            <>
              {arrow("left")}
              {arrow("right")}
            </>
          )}
        </Box>
      )}
    </Dialog>
  );
}
