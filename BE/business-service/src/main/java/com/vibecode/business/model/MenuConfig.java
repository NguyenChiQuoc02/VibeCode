package com.vibecode.business.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Một mục menu của sidebar. icon là khóa icon do FE định nghĩa.
 * Menu có href là trang (lá); menu không có href là nhóm, chỉ chứa các menu con (parentId trỏ về nhóm).
 * Chỉ hỗ trợ hai cấp: nhóm không được nằm trong nhóm khác.
 */
@Document("menus")
public record MenuConfig(
        @Id String id,
        @NotBlank(message = "Tên menu không được để trống") String label,
        @Pattern(regexp = "^$|^/.*", message = "Đường dẫn phải bắt đầu bằng /") String href,
        String icon,
        int order,
        boolean visible,
        boolean adminOnly,
        String parentId) {

    /** Trang cấu hình menu: luôn hiện, không được xóa và luôn ở cấp gốc để quản trị viên không tự khóa mình. */
    public static final String CONFIG_HREF = "/dashboard/menus";

    public MenuConfig withId(String newId) {
        return new MenuConfig(newId, label, href, icon, order, visible, adminOnly, parentId);
    }

    /** Chuẩn hóa dữ liệu nhận từ FE: chuỗi rỗng thành null cho parentId, cắt khoảng trắng đường dẫn. */
    public MenuConfig normalized() {
        String p = parentId == null || parentId.isBlank() ? null : parentId;
        String h = href == null ? "" : href.trim();
        return new MenuConfig(id, label.trim(), h, icon, order, visible, adminOnly, p);
    }

    @JsonIgnore
    public boolean isProtected() {
        return CONFIG_HREF.equals(href);
    }

    /** Nhóm menu: không có đường dẫn. */
    @JsonIgnore
    public boolean isGroup() {
        return href == null || href.isBlank();
    }
}
