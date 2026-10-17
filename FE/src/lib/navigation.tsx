import { ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import PeopleIcon from "@mui/icons-material/PeopleAlt";
import FolderIcon from "@mui/icons-material/FolderCopy";
import MapIcon from "@mui/icons-material/Map";
import EventIcon from "@mui/icons-material/Event";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import InsightsIcon from "@mui/icons-material/Insights";
import SettingsIcon from "@mui/icons-material/Settings";
import HubIcon from "@mui/icons-material/Hub";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import TourIcon from "@mui/icons-material/Tour";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SellIcon from "@mui/icons-material/Sell";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

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
  /** Cấu hình ẩn/hiện lấy từ API; mặc định là hiện. */
  visible?: boolean;
  /** Menu con của một nhóm (nhóm không có đường dẫn). */
  children?: NavItem[];
}

/** Bảng icon cho menu cấu hình được; khóa phải khớp MenuSeeder ở BE. */
export const ICONS: Record<string, ReactNode> = {
  dashboard: <DashboardIcon />,
  people: <PeopleIcon />,
  folder: <FolderIcon />,
  map: <MapIcon />,
  event: <EventIcon />,
  landmark: <AccountBalanceIcon />,
  travel: <TravelExploreIcon />,
  insights: <InsightsIcon />,
  settings: <SettingsIcon />,
  hub: <HubIcon />,
  menu: <MenuOpenIcon />,
  tour: <TourIcon />,
  booking: <ConfirmationNumberIcon />,
  car: <DirectionsCarIcon />,
  brand: <SellIcon />,
  recommend: <AutoAwesomeIcon />,
};
export const ICON_OPTIONS = Object.keys(ICONS).map((k) => ({ value: k, label: k }));

/** Mặc định khi chưa tải được cấu hình menu từ API. */
export const NAV: NavItem[] = [
  { label: "Tổng quan", title: "Tổng quan", subtitle: "Số liệu tổng hợp của hệ thống", icon: <DashboardIcon />, href: "/dashboard" },
  { label: "Người dùng", title: "Người dùng", subtitle: "Danh sách tài khoản trong hệ thống", icon: <PeopleIcon />, href: "/dashboard/users", adminOnly: true },
  { label: "Tệp & Media", title: "Tệp & Media", icon: <FolderIcon />, href: "/dashboard/files" },
  { label: "Bản đồ", title: "Bản đồ hành chính", subtitle: "Xem ranh giới tỉnh, thành phố, xã, phường trên bản đồ", icon: <MapIcon />, href: "/dashboard/map" },
  { label: "Ngày lễ", title: "Ngày lễ Việt Nam", subtitle: "Quản lý danh sách ngày lễ, ngày kỷ niệm", icon: <EventIcon />, href: "/dashboard/holidays" },
  { label: "Di tích, thắng cảnh", title: "Di tích, danh lam thắng cảnh", subtitle: "Quản lý danh sách di tích, thắng cảnh trong hệ thống", icon: <AccountBalanceIcon />, href: "/dashboard/landmarks" },
  { label: "Địa điểm du lịch", title: "Địa điểm du lịch", subtitle: "Quản lý danh sách địa điểm du lịch", icon: <TravelExploreIcon />, href: "/dashboard/destinations" },
  { label: "Báo cáo", title: "Báo cáo thống kê", subtitle: "Biểu đồ phân tích dữ liệu từ Superset", icon: <InsightsIcon />, href: "/dashboard/analytics" },
  { label: "Màn hình chính", title: "Màn hình chính", subtitle: "Các nhóm dữ liệu chính của hệ thống", icon: <HubIcon />, href: "/main-dashboard" },
  { label: "Tour", title: "Quản lý tour", subtitle: "Tạo tour và liên kết với địa điểm du lịch, di tích", icon: <TourIcon />, href: "/dashboard/tours", adminOnly: true },
  { label: "Đăng ký tour", title: "Đăng ký tour", subtitle: "Danh sách đăng ký, xác nhận hoàn thành và thu tiền mặt", icon: <ConfirmationNumberIcon />, href: "/dashboard/bookings", adminOnly: true },
  { label: "Gợi ý tour", title: "Hệ thống gợi ý", subtitle: "Trạng thái mô hình, làm mới thủ công và hiệu quả gợi ý", icon: <AutoAwesomeIcon />, href: "/dashboard/recommend", adminOnly: true },
  { label: "Hãng xe", title: "Hãng xe", subtitle: "Quản lý danh sách hãng xe hơi", icon: <SellIcon />, href: "/dashboard/car-brands", adminOnly: true },
  { label: "Mẫu xe", title: "Mẫu xe hơi", subtitle: "Quản lý danh sách mẫu xe của các hãng", icon: <DirectionsCarIcon />, href: "/dashboard/cars", adminOnly: true },
  { label: "Lịch lái thử", title: "Lịch lái thử", subtitle: "Xác nhận và theo dõi lịch hẹn lái thử của khách", icon: <ConfirmationNumberIcon />, href: "/dashboard/test-drives", adminOnly: true },
  { label: "Cấu hình menu", title: "Cấu hình menu", subtitle: "Thêm, sửa, xóa và ẩn hiện menu trên thanh bên", icon: <SettingsIcon />, href: "/dashboard/menus", adminOnly: true },
];

export function findNav(pathname: string, items: NavItem[] = NAV): NavItem | undefined {
  // Khớp chính xác, hoặc menu dài nhất là tiền tố (trang con như /dashboard/landmarks/new).
  // Nhóm menu không có đường dẫn nên bị bỏ qua.
  return items
    .filter((n) => n.href && (pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(`${n.href}/`))))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
