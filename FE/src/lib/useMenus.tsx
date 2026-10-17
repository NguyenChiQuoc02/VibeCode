"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuConfig, menuApi } from "@/lib/api";
import { ICONS, NAV, NavItem } from "@/lib/navigation";

/** Đường dẫn trang cấu hình menu: luôn hiện để quản trị viên không tự khóa mình. */
const CONFIG_HREF = "/dashboard/menus";

export interface Menus {
  /** Mọi trang (kể cả đang ẩn) để tra tiêu đề; không gồm nhóm menu vì nhóm không có trang. */
  all: NavItem[];
  /** Các trang đang hiện, dạng phẳng. */
  visible: NavItem[];
  /** Cây menu đang hiện cho sidebar: nhóm chứa menu con, nhóm ẩn hoặc không còn menu con hiện thì bị bỏ. */
  tree: NavItem[];
}

const toNav = (m: MenuConfig): NavItem => {
  const base = NAV.find((n) => n.href === m.href);
  return {
    label: m.label,
    title: base?.title ?? m.label,
    subtitle: base?.subtitle,
    icon: ICONS[m.icon] ?? ICONS.menu,
    href: m.href,
    adminOnly: m.adminOnly,
    visible: m.visible,
  };
};

/**
 * Menu lấy từ API (có thứ tự, ẩn/hiện, hai cấp: nhóm và menu con).
 * API lỗi hoặc chưa có dữ liệu thì dùng NAV mặc định (phẳng).
 */
export function useMenus(): Menus {
  const { data } = useQuery({ queryKey: ["menus"], queryFn: () => menuApi.list(), staleTime: 60_000 });
  return useMemo(() => {
    if (!data || data.length === 0) return { all: NAV, visible: NAV, tree: NAV };
    // API trả bản ghi mới nhất trước; sidebar thì theo thứ tự đã cấu hình.
    const items = [...data].sort((a, b) => a.order - b.order);
    const ids = new Set(items.map((m) => m.id));
    const isLeaf = (m: MenuConfig) => Boolean(m.href);
    const shown = (m: MenuConfig) => m.visible || m.href === CONFIG_HREF;

    // Menu có parentId không còn tồn tại được coi là menu gốc.
    const roots = items.filter((m) => !m.parentId || !ids.has(m.parentId));
    const tree: NavItem[] = [];
    for (const m of roots) {
      if (isLeaf(m)) {
        if (shown(m)) tree.push(toNav(m));
        continue;
      }
      // Nhóm ẩn thì ẩn cả menu con; nhóm không còn menu con hiện thì không cần hiện.
      if (!m.visible) continue;
      const children = items.filter((c) => c.parentId === m.id && isLeaf(c) && shown(c)).map(toNav);
      if (children.length > 0) tree.push({ ...toNav(m), href: "", children });
    }
    const all = items.filter(isLeaf).map(toNav);
    const visible = tree.flatMap((n) => n.children ?? [n]);
    return { all, visible, tree };
  }, [data]);
}
