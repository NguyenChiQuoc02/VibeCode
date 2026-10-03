import { ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import PeopleIcon from "@mui/icons-material/PeopleAlt";
import FolderIcon from "@mui/icons-material/FolderCopy";
import MapIcon from "@mui/icons-material/Map";
import EventIcon from "@mui/icons-material/Event";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

export interface NavItem {
  /** Tên hiển thị trên menu. */
  label: string;
  /** Tiêu đề trang, cũng là tiêu đề tab trình duyệt. */
  title: string;
  /** Mô tả ngắn dưới tiêu đề trang. */
  subtitle?: string;
  icon: ReactNode;
  href: string;
  adminOnly?: boolean;
}

export const NAV: NavItem[] = [
  { label: "Tổng quan", title: "Tổng quan", subtitle: "Số liệu tổng hợp của hệ thống", icon: <DashboardIcon />, href: "/dashboard" },
  { label: "Người dùng", title: "Người dùng", subtitle: "Danh sách tài khoản trong hệ thống", icon: <PeopleIcon />, href: "/dashboard/users", adminOnly: true },
  { label: "Tệp & Media", title: "Tệp & Media", icon: <FolderIcon />, href: "/dashboard/files" },
  { label: "Bản đồ", title: "Bản đồ hành chính", subtitle: "Xem ranh giới tỉnh, thành phố, xã, phường trên bản đồ", icon: <MapIcon />, href: "/dashboard/map" },
  { label: "Ngày lễ", title: "Ngày lễ Việt Nam", subtitle: "Quản lý danh sách ngày lễ, ngày kỷ niệm", icon: <EventIcon />, href: "/dashboard/holidays" },
  { label: "Di tích, thắng cảnh", title: "Di tích, danh lam thắng cảnh", subtitle: "Quản lý danh sách di tích, thắng cảnh trong hệ thống", icon: <AccountBalanceIcon />, href: "/dashboard/landmarks" },
  { label: "Địa điểm du lịch", title: "Địa điểm du lịch", subtitle: "Quản lý danh sách địa điểm du lịch", icon: <TravelExploreIcon />, href: "/dashboard/destinations" },
];

export function findNav(pathname: string): NavItem | undefined {
  // Khớp chính xác, hoặc menu dài nhất là tiền tố (trang con như /dashboard/landmarks/new).
  return NAV.filter((n) => pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(`${n.href}/`))).sort((a, b) => b.href.length - a.href.length)[0];
}
