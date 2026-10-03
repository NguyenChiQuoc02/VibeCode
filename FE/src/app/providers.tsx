"use client";

import { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "@/context/AuthContext";

const theme = createTheme({ palette: { primary: { main: "#4f46e5" } } });

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
