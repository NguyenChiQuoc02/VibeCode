"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "@/context/AuthContext";

const theme = createTheme({
  palette: {
    primary: { main: "#00A76F", dark: "#007867", light: "#5BE49B", contrastText: "#FFFFFF" },
    secondary: { main: "#8E33FF" },
    info: { main: "#00B8D9" },
    success: { main: "#22C55E" },
    warning: { main: "#FFAB00" },
    error: { main: "#FF5630" },
    background: { default: "#F3F7FB", paper: "#FFFFFF" },
    text: { primary: "#1C252E", secondary: "#637381" },
    divider: "rgba(145, 158, 171, 0.2)",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Public Sans", "Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(145,158,171,0.5) transparent",
        },
        "*::-webkit-scrollbar": { width: 6, height: 6 },
        "*::-webkit-scrollbar-track": { background: "transparent" },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(145,158,171,0.5)",
          borderRadius: 3,
        },
        "*::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(145,158,171,0.8)" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid rgba(145,158,171,0.18)",
          boxShadow: "0 2px 8px rgba(145,158,171,0.1)",
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiTableCell: {
      styleOverrides: {
        head: { backgroundColor: "#F4F8F7", color: "#637381", fontWeight: 600, fontSize: 13, borderBottom: "none" },
        body: { fontSize: 13 },
      },
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } }));
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
