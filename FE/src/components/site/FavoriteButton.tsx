"use client";

import { MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, ButtonBase, Tooltip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { FavoriteType } from "@/lib/api";
import { rememberNext } from "@/lib/loginRedirect";
import { useToast } from "@/context/ToastContext";
import { useFavorites } from "@/components/site/useFavorites";

interface Props {
  type: FavoriteType;
  id: string;
  /** overlay: nút tròn trắng đặt trên ảnh; pill: nút có chữ ở trang chi tiết. */
  variant?: "overlay" | "pill";
}

/** Nút tim. Chưa đăng nhập thì chuyển sang trang đăng nhập và quay lại đúng trang này sau đó. */
export default function FavoriteButton({ type, id, variant = "overlay" }: Props) {
  const { loggedIn, isFavorite, set } = useFavorites();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const on = isFavorite(type, id);

  const click = (e: MouseEvent) => {
    // Thẻ nằm trong liên kết nên phải chặn việc mở trang chi tiết.
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      toast.error("Hãy đăng nhập để lưu mục yêu thích");
      rememberNext(pathname);
      router.push("/login");
      return;
    }
    set(type, id, !on);
  };

  if (variant === "pill") {
    return (
      <ButtonBase
        onClick={click}
        aria-pressed={on}
        sx={{ gap: 0.75, px: 2, height: 40, borderRadius: 5, fontWeight: 700, fontSize: 13, color: on ? "#fff" : "#0B2B26", bgcolor: on ? "#FF3B5C" : "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", boxShadow: "0 6px 18px rgba(0,0,0,0.18)", transition: "transform .15s", "&:hover": { transform: "translateY(-2px)" } }}
      >
        {on ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
        {on ? "Đã yêu thích" : "Yêu thích"}
      </ButtonBase>
    );
  }

  return (
    <Tooltip title={on ? "Bỏ yêu thích" : "Yêu thích"}>
      <Box
        component="span"
        role="button"
        aria-label={on ? "Bỏ yêu thích" : "Yêu thích"}
        aria-pressed={on}
        onClick={click}
        sx={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer", bgcolor: "rgba(255,255,255,0.95)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", transition: "transform .15s", "&:hover": { transform: "scale(1.12)" }, "&:active": { transform: "scale(0.94)" } }}
      >
        {on ? <FavoriteIcon sx={{ fontSize: 19, color: "#FF3B5C" }} /> : <FavoriteBorderIcon sx={{ fontSize: 19, color: "#5F7A74" }} />}
      </Box>
    </Tooltip>
  );
}
