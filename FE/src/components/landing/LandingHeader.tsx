"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Box, Button, Divider, IconButton, ListItemIcon, Menu, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/landing/Logo";

export const BRAND = "#0E7C5B";

const activeSx = { color: BRAND, borderRadius: 0, borderBottom: `2px solid ${BRAND}` };
const linkSx = { color: "#1C252E", fontWeight: 600, fontSize: 13, px: 1.5, minWidth: 0, "&:hover": { bgcolor: "transparent", color: BRAND } };

/** Header dùng chung cho trang chủ và mọi trang người dùng. Chỉ ADMIN mới thấy lối vào khu quản trị. */
export default function LandingHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [explore, setExplore] = useState<HTMLElement | null>(null);
  const [account, setAccount] = useState<HTMLElement | null>(null);

  const is = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
  const nav = (active: boolean) => (active ? { ...linkSx, ...activeSx } : linkSx);

  return (
    <Box
      component="header"
      sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 20, px: { xs: 2, md: "4.8%" }, py: 1, bgcolor: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: "0 1px 0 rgba(11,61,53,0.06)" }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box component={NextLink} href="/" sx={{ textDecoration: "none" }}>
          <Logo />
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1, justifyContent: "center" }}>
          <Button component={NextLink} href="/" sx={nav(pathname === "/")}>
            Trang chủ
          </Button>
          <Button sx={nav(is("/explore"))} endIcon={<KeyboardArrowDownIcon fontSize="small" />} onClick={(e) => setExplore(e.currentTarget)}>
            Khám phá
          </Button>
          <Menu anchorEl={explore} open={Boolean(explore)} onClose={() => setExplore(null)}>
            <MenuItem component={NextLink} href="/explore?tab=landmarks" onClick={() => setExplore(null)}>
              Di tích danh lam thắng cảnh
            </MenuItem>
            <MenuItem component={NextLink} href="/explore?tab=destinations" onClick={() => setExplore(null)}>
              Địa điểm du lịch
            </MenuItem>
          </Menu>
          <Button component={NextLink} href="/tours" sx={nav(is("/tours"))}>
            Tour
          </Button>
          <Button component={NextLink} href="/map" sx={nav(is("/map"))}>
            Bản đồ
          </Button>
          <Button component={NextLink} href="/blog" sx={nav(is("/blog"))}>
            Blog
          </Button>
          <Button component={NextLink} href="/about" sx={nav(is("/about"))}>
            Về chúng tôi
          </Button>
          <Button component={NextLink} href="/game" sx={nav(is("/game"))}>
            Game
          </Button>
        </Stack>

        <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />
        <Tooltip title="Tìm kiếm">
          <IconButton aria-label="Tìm kiếm" component={NextLink} href="/explore">
            <SearchIcon />
          </IconButton>
        </Tooltip>

        {user ? (
          <>
            <Tooltip title="Yêu thích của tôi">
              <IconButton aria-label="Yêu thích" component={NextLink} href="/favorites" sx={{ color: is("/favorites") ? "#FF3B5C" : undefined }}>
                <FavoriteBorderIcon />
              </IconButton>
            </Tooltip>
            <IconButton aria-label="Tài khoản" onClick={(e) => setAccount(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: BRAND, fontSize: 15, fontWeight: 700 }}>{user.fullName.charAt(0).toUpperCase()}</Avatar>
            </IconButton>
            <Menu anchorEl={account} open={Boolean(account)} onClose={() => setAccount(null)} PaperProps={{ sx: { minWidth: 230, borderRadius: 3, mt: 1 } }}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{user.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider sx={{ borderStyle: "dashed" }} />
              <MenuItem component={NextLink} href="/profile" onClick={() => setAccount(null)}>
                <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                Hồ sơ cá nhân
              </MenuItem>
              <MenuItem component={NextLink} href="/my-tours" onClick={() => setAccount(null)}>
                <ListItemIcon><LuggageOutlinedIcon fontSize="small" /></ListItemIcon>
                Tour của tôi
              </MenuItem>
              <MenuItem component={NextLink} href="/favorites" onClick={() => setAccount(null)}>
                <ListItemIcon><FavoriteBorderIcon fontSize="small" /></ListItemIcon>
                Yêu thích
              </MenuItem>
              {user.role === "ADMIN" && (
                <MenuItem component={NextLink} href="/dashboard" onClick={() => setAccount(null)}>
                  <ListItemIcon><DashboardOutlinedIcon fontSize="small" /></ListItemIcon>
                  Vào quản trị
                </MenuItem>
              )}
              <Divider sx={{ borderStyle: "dashed" }} />
              <MenuItem
                onClick={() => {
                  setAccount(null);
                  logout();
                  router.push("/");
                }}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                Đăng xuất
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button component={NextLink} href="/login" variant="outlined" sx={{ display: { xs: "none", sm: "inline-flex" }, borderRadius: 5, px: 2.5, color: "#1C252E", borderColor: "rgba(145,158,171,0.4)" }}>
              Đăng nhập
            </Button>
            <Button component={NextLink} href="/register" variant="contained" sx={{ bgcolor: BRAND, borderRadius: 5, px: 2.5, boxShadow: "none", "&:hover": { bgcolor: "#0B6A4E" } }}>
              Đăng ký
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}
