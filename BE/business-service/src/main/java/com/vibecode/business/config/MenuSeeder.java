package com.vibecode.business.config;

import com.vibecode.business.model.MenuConfig;
import com.vibecode.business.repository.MenuConfigRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** Nạp menu mặc định khi collection menus còn trống. Khóa icon phải khớp bảng ICONS ở FE (lib/navigation.tsx). */
@Component
public class MenuSeeder implements ApplicationRunner {

    private final MenuConfigRepository repo;

    public MenuSeeder(MenuConfigRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repo.count() > 0) return;
        repo.saveAll(List.of(
                item("Tổng quan", "/dashboard", "dashboard", 1, false, null),
                item("Người dùng", "/dashboard/users", "people", 2, true, null),
                item("Tệp & Media", "/dashboard/files", "folder", 3, false, null),
                item("Báo cáo", "/dashboard/analytics", "insights", 4, false, null),
                item("Màn hình chính", "/main-dashboard", "hub", 5, false, null),
                item("Cấu hình menu", MenuConfig.CONFIG_HREF, "settings", 9, true, null)));

        // Nhóm không có đường dẫn; menu con trỏ về nhóm qua parentId.
        MenuConfig travel = repo.save(item("Du lịch", "", "travel", 6, false, null));
        repo.saveAll(List.of(
                item("Bản đồ", "/dashboard/map", "map", 1, false, travel.id()),
                item("Ngày lễ", "/dashboard/holidays", "event", 2, false, travel.id()),
                item("Di tích, thắng cảnh", "/dashboard/landmarks", "landmark", 3, false, travel.id()),
                item("Địa điểm du lịch", "/dashboard/destinations", "travel", 4, false, travel.id()),
                item("Tour", "/dashboard/tours", "tour", 5, true, travel.id()),
                item("Đăng ký tour", "/dashboard/bookings", "booking", 6, true, travel.id())));

        MenuConfig cars = repo.save(item("Quản lý xe hơi", "", "car", 7, false, null));
        repo.saveAll(List.of(
                item("Hãng xe", "/dashboard/car-brands", "brand", 1, true, cars.id()),
                item("Mẫu xe", "/dashboard/cars", "car", 2, true, cars.id()),
                item("Lịch lái thử", "/dashboard/test-drives", "booking", 3, true, cars.id())));
    }

    private static MenuConfig item(String label, String href, String icon, int order, boolean adminOnly, String parentId) {
        return new MenuConfig(null, label, href, icon, order, true, adminOnly, parentId);
    }
}
