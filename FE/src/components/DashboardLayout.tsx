"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/NotificationsNone";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/context/AuthContext";
import { findNav, NAV } from "@/lib/navigation";
import VietnamIllustration from "@/components/VietnamIllustration";

const NAV_WIDTH = 260;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState("");

  // Tiêu đề tab trình duyệt đổi theo menu đang mở.
  useEffect(() => {
    const nav = findNav(pathname);
    document.title = nav ? `${nav.title} | VibeCode` : "VibeCode";
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/dashboard/landmarks?q=${encodeURIComponent(q)}` : "/dashboard/landmarks");
  };

  const nav = (
    <Stack sx={{ width: NAV_WIDTH, height: "100%", p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1.5, py: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 1.5, background: "linear-gradient(135deg, #00A76F, #007867)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800 }}>V</Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          VibeCode
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, my: 1.5, borderRadius: 2, bgcolor: "rgba(145,158,171,0.12)" }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>{user.fullName.charAt(0).toUpperCase()}</Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user.fullName}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {user.role}
          </Typography>
        </Box>
      </Stack>

      <Typography variant="overline" color="text.disabled" sx={{ px: 1.5, lineHeight: 2 }}>
        Menu
      </Typography>
      <List disablePadding>
        {NAV.filter((n) => !n.adminOnly || user.role === "ADMIN").map((n) => (
          <ListItemButton
            key={n.label}
            component={NextLink}
            href={n.href}
            selected={pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(`${n.href}/`))}
            onClick={() => setOpen(false)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              minHeight: 42,
              color: "text.secondary",
              "&.Mui-selected": { bgcolor: "rgba(0,167,111,0.1)", color: "primary.dark" },
              "&.Mui-selected:hover": { bgcolor: "rgba(0,167,111,0.16)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: "inherit", "& svg": { fontSize: 20 } }}>{n.icon}</ListItemIcon>
            <ListItemText primary={n.label} primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Stack alignItems="center" sx={{ pt: 3, pb: 1 }}>
        <VietnamIllustration width={190} />
        <Typography variant="subtitle2" color="primary.main" sx={{ mt: 1 }}>
          Khám phá Việt Nam
        </Typography>
        <Typography variant="caption" color="text.disabled" align="center">
          Giữ gìn giá trị - Lan tỏa vẻ đẹp
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{ width: NAV_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: NAV_WIDTH, overflowX: "hidden", borderRight: "1px solid rgba(145,158,171,0.2)", bgcolor: "#fff" } }}
        >
          {nav}
        </Drawer>
      ) : (
        <Drawer open={open} onClose={() => setOpen(false)}>
          {nav}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: (t) => t.zIndex.appBar,
            px: { xs: 2, md: 4 },
            py: 1.5,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            bgcolor: "rgba(255,255,255,0.72)",
            borderBottom: "1px solid rgba(145,158,171,0.2)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {!isDesktop && (
              <IconButton onClick={() => setOpen(true)} edge="start" aria-label="Mở menu">
                <MenuIcon />
              </IconButton>
            )}
            <Box component="form" onSubmit={submitSearch} sx={{ flexGrow: 1, maxWidth: 440 }}>
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm di tích, thắng cảnh..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 5, bgcolor: "#F4F7FB", "& fieldset": { borderColor: "transparent" } },
                }}
              />
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton aria-label="Thông báo">
              <Badge badgeContent={2} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16 } }}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Tài khoản" sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 15, fontWeight: 700 }}>{user.fullName.charAt(0).toUpperCase()}</Avatar>
            </IconButton>
            <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Thêm" size="small">
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{user.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider sx={{ borderStyle: "dashed" }} />
              <MenuItem
                onClick={() => {
                  setAnchor(null);
                  logout();
                  router.push("/login");
                }}
                sx={{ color: "error.main" }}
              >
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Đăng xuất
              </MenuItem>
            </Menu>
          </Stack>
        </Box>

        <Box component="main" sx={{ p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
