"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

type Severity = "success" | "error";

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Toast toàn cục, nằm ngoài từng trang nên vẫn hiện khi trang vừa lưu chuyển hướng sang trang khác. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; severity: Severity; key: number } | null>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback((severity: Severity, message: string) => {
    setToast({ message, severity, key: Date.now() });
    setOpen(true);
  }, []);

  const api = useMemo<ToastApi>(() => ({ success: (m) => show("success", m), error: (m) => show("error", m) }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        key={toast?.key}
        open={open}
        autoHideDuration={3000}
        onClose={(_, reason) => reason !== "clickaway" && setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={toast?.severity ?? "success"} variant="filled" onClose={() => setOpen(false)} sx={{ width: "100%" }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast phải nằm trong ToastProvider");
  return ctx;
}
