"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch, Tooltip } from "@mui/material";
import { MenuConfig, menuApi } from "@/lib/api";

/** Công tắc ẩn/hiện menu ngay trong bảng danh sách. */
export default function MenuVisibleSwitch({ row }: { row: MenuConfig }) {
  const qc = useQueryClient();
  const toggle = useMutation({
    mutationFn: () => {
      const { id, ...body } = row;
      return menuApi.update(id, { ...body, visible: !row.visible });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menus"] }),
  });
  const locked = row.href === "/dashboard/menus";
  return (
    <Tooltip title={locked ? "Menu này luôn hiện" : row.visible ? "Bấm để ẩn" : "Bấm để hiện"}>
      <span>
        <Switch size="small" checked={row.visible} disabled={locked || toggle.isPending} onChange={() => toggle.mutate()} />
      </span>
    </Tooltip>
  );
}
