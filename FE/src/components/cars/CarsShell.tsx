"use client";

import { ReactNode, useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Box, Button, Divider, IconButton, ListItemIcon, Menu, MenuItem, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import EventAvailableIcon from "@mui/icons-material/EventAvailableOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { AUTO } from "@/components/cars/theme";
import { useAuth } from "@/context/AuthContext";

export function AutoLogo({ light = false }: { light?: boolean }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <svg width="40" height="30" viewBox="0 0 40 30" aria-hidden>
        <path d="M2 22 L14 6 H34 L38 12 L24 12 L18 22 Z" fill={AUTO.red} />
        <path d="M10 26 L18 15 H30 L22 26 Z" fill={AUTO.redDark} />
      </svg>
      <Box sx={{ lineHeight: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 19, letterSpacing: -0.3, lineHeight: 1.1, color: light ? "#fff" : AUTO.ink, fontStyle: "italic" }}>AutoDrive</Typography>
        <Typography sx={{ fontSize: 8, letterSpacing: 1.5, color: light ? "rgba(255,255,255,0.7)" : AUTO.muted }}>Drive Your Dream</Typography>
      </Box>
    </Stack>
  );
}

const LINKS: [string, string][] = [
  ["Trang chủ", "/cars"],
  ["Xe mới", "/cars/catalog"],
  ["Hãng xe", "/cars#brands"],
  ["Dịch vụ", "/cars#services"],
  ["Về chúng tôi", "/cars#about"],
  ["Liên hệ", "/cars#contact"],
];

/** Header trong suốt đè lên hero ở trang chủ, đổi sang nền tối đặc khi cuộn. Trang khác luôn dùng nền tối. */
function Header({ overlay }: { overlay: boolean }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [solid, setSolid] = useState(!overlay);
  const [account, setAccount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const active = (href: string) => (href === "/cars" ? pathname === "/cars" : !href.includes("#") && pathname.startsWith(href));

  return (
    <Box
      component="header"
      sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30, px: { xs: 2, md: "7%" }, py: 1.25, transition: "background .25s, box-shadow .25s", bgcolor: solid ? "rgba(12,15,21,0.94)" : "transparent", backdropFilter: solid ? "blur(10px)" : "none", boxShadow: solid ? "0 1px 0 rgba(255,255,255,0.06)" : "none" }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box component={NextLink} href="/cars" sx={{ textDecoration: "none" }}>
          <AutoLogo light />
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1, justifyContent: "center" }}>
          {LINKS.map(([label, href]) => (
            <Button
              key={label}
              component={NextLink}
              href={href}
              sx={{ color: "#fff", fontWeight: 600, fontSize: 12.5, px: 1.75, minWidth: 0, borderRadius: 0, opacity: active(href) ? 1 : 0.85, borderBottom: `2px solid ${active(href) ? AUTO.red : "transparent"}`, "&:hover": { bgcolor: "transparent", opacity: 1 } }}
            >
              {label}
            </Button>
          ))}
        </Stack>
        <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />
        <IconButton aria-label="Tìm xe" component={NextLink} href="/cars/catalog" sx={{ color: "#fff" }}>
          <SearchIcon fontSize="small" />
        </IconButton>
        {user ? (
          <>
            <IconButton aria-label="Tài khoản" onClick={(e) => setAccount(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: AUTO.red, fontSize: 14, fontWeight: 700 }}>{user.fullName.charAt(0).toUpperCase()}</Avatar>
            </IconButton>
            <Menu anchorEl={account} open={Boolean(account)} onClose={() => setAccount(null)} PaperProps={{ sx: { minWidth: 220, borderRadius: 2, mt: 1 } }}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{user.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider sx={{ borderStyle: "dashed" }} />
              <MenuItem component={NextLink} href="/cars/my-test-drives" onClick={() => setAccount(null)}>
                <ListItemIcon><EventAvailableIcon fontSize="small" /></ListItemIcon>
                Lịch lái thử của tôi
              </MenuItem>
              <MenuItem component={NextLink} href="/" onClick={() => setAccount(null)}>
                <ListItemIcon><FavoriteBorderIcon fontSize="small" /></ListItemIcon>
                Trang du lịch
              </MenuItem>
              {user.role === "ADMIN" && (
                <MenuItem component={NextLink} href="/dashboard/cars" onClick={() => setAccount(null)}>
                  <ListItemIcon><DashboardOutlinedIcon fontSize="small" /></ListItemIcon>
                  Vào quản trị
                </MenuItem>
              )}
              <Divider sx={{ borderStyle: "dashed" }} />
              <MenuItem
                onClick={() => {
                  setAccount(null);
                  logout();
                  router.push("/cars");
                }}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                Đăng xuất
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button component={NextLink} href="/login" sx={{ display: { xs: "none", sm: "inline-flex" }, color: "#fff", fontSize: 12.5, fontWeight: 600 }}>
            Đăng nhập
          </Button>
        )}
        <Button component={NextLink} href="/cars/catalog" variant="contained" sx={{ bgcolor: AUTO.red, borderRadius: 6, px: 2.5, fontSize: 12.5, fontWeight: 700, boxShadow: "none", whiteSpace: "nowrap", "&:hover": { bgcolor: AUTO.redDark, boxShadow: "none" } }}>
          Đặt lịch lái thử
        </Button>
      </Stack>
    </Box>
  );
}

const FOOT_COLS: { title: string; links: [string, string][] }[] = [
  { title: "Danh mục", links: [["Xe mới", "/cars/catalog"], ["Hãng xe", "/cars#brands"], ["Dịch vụ", "/cars#services"], ["Về chúng tôi", "/cars#about"], ["Liên hệ", "/cars#contact"]] },
  { title: "Hỗ trợ khách hàng", links: [["Chính sách bảo hành", "/cars#services"], ["Chính sách đổi trả", "/cars#services"], ["Hướng dẫn mua xe", "/cars/catalog"], ["Lịch lái thử của tôi", "/cars/my-test-drives"], ["Trang du lịch", "/"]] },
];

function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <Box component="footer" id="contact" sx={{ bgcolor: AUTO.night, color: "rgba(255,255,255,0.72)", mt: 0 }}>
      <Box sx={{ px: { xs: 2, md: "7%" }, py: 6, display: "grid", gap: 5, gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr 1fr 1.4fr" } }}>
        <Box>
          <AutoLogo light />
          <Typography sx={{ mt: 2, fontSize: 12.5, lineHeight: 1.8, maxWidth: 330 }}>
            AutoDrive - nơi khởi nguồn của những hành trình tuyệt vời. Chúng tôi cam kết mang đến cho bạn những chiếc xe tốt nhất cùng dịch vụ hoàn hảo nhất.
          </Typography>
          <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
            {[FacebookIcon, YouTubeIcon, InstagramIcon].map((Icon, i) => (
              <Box key={i} sx={{ width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,0.3)", "&:hover": { bgcolor: AUTO.red, borderColor: AUTO.red } }}>
                <Icon sx={{ fontSize: 17, color: "#fff" }} />
              </Box>
            ))}
          </Stack>
        </Box>
        {FOOT_COLS.map((c) => (
          <Box key={c.title}>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 13, mb: 1.5 }}>{c.title}</Typography>
            <Stack spacing={1}>
              {c.links.map(([l, h]) => (
                <Box key={l} component={NextLink} href={h} sx={{ color: "inherit", textDecoration: "none", fontSize: 12.5, "&:hover": { color: "#fff" } }}>
                  {l}
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 13, mb: 1.5 }}>Đăng ký nhận tin</Typography>
          <Typography sx={{ fontSize: 12.5, mb: 1.5 }}>Nhận thông tin khuyến mãi và cập nhật mẫu xe mới nhất từ AutoDrive.</Typography>
          {done ? (
            <Typography sx={{ color: "#fff", fontSize: 13 }}>Cảm ơn bạn đã đăng ký!</Typography>
          ) : (
            <Stack
              component="form"
              direction="row"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setDone(true);
              }}
            >
              <TextField
                size="small"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ flex: 1, "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.06)", borderRadius: "6px 0 0 6px", fontSize: 13, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } } }}
              />
              <Button type="submit" variant="contained" aria-label="Đăng ký" sx={{ minWidth: 48, borderRadius: "0 6px 6px 0", bgcolor: AUTO.red, boxShadow: "none", "&:hover": { bgcolor: AUTO.redDark } }}>
                <ArrowForwardIcon fontSize="small" />
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" sx={{ px: { xs: 2, md: "7%" }, py: 2, fontSize: 11.5 }} spacing={1}>
        <Box>© {new Date().getFullYear()} AutoDrive. All rights reserved.</Box>
        <Box>Dữ liệu mẫu xe: Wikidata (CC0). Giá chỉ mang tính tham khảo.</Box>
      </Stack>
    </Box>
  );
}

/** Khung chung cho các trang xe hơi. overlay: header trong suốt đè lên hero (trang chủ). */
export default function CarsShell({ children, overlay = false }: { children: ReactNode; overlay?: boolean }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: AUTO.bg }}>
      <Header overlay={overlay} />
      <Box component="main" sx={{ flexGrow: 1, pt: overlay ? 0 : "68px" }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
