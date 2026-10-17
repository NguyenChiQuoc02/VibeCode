"use client";

import { ReactNode, useState } from "react";
import { IconButton, InputAdornment, TextField, TextFieldProps } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import { SITE } from "@/components/site/tokens";

type Props = Omit<TextFieldProps, "variant" | "InputProps"> & { icon: ReactNode };

/** Ô nhập có icon đầu dòng; type="password" có nút hiện/ẩn mật khẩu. */
export default function AuthField({ icon, type, ...rest }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <TextField
      {...rest}
      type={isPassword && show ? "text" : type}
      fullWidth
      InputProps={{
        startAdornment: <InputAdornment position="start" sx={{ color: SITE.muted }}>{icon}</InputAdornment>,
        endAdornment: isPassword ? (
          <InputAdornment position="end">
            <IconButton aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"} edge="end" size="small" onClick={() => setShow((s) => !s)}>
              {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ) : undefined,
        sx: { borderRadius: 3, bgcolor: "#FAFCFB" },
      }}
    />
  );
}

export const submitSx = {
  mt: 0.5,
  py: 1.4,
  borderRadius: 3,
  fontWeight: 700,
  fontSize: 15,
  textTransform: "none" as const,
  background: SITE.gradientBrand,
  boxShadow: "0 10px 22px rgba(14,124,91,0.35)",
  "&:hover": { background: SITE.gradientBrand, filter: "brightness(1.06)", boxShadow: "0 14px 28px rgba(14,124,91,0.42)" },
};
