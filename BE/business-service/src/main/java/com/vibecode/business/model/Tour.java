package com.vibecode.business.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Tour du lịch, liên kết với các địa điểm du lịch (destinationIds) và di tích, danh lam thắng cảnh (landmarkIds).
 * status: OPEN (nhận đăng ký) | CLOSED (đóng đăng ký) | CANCELLED (hủy tour).
 */
@Document("tours")
public record Tour(
        @Id String id,
        @NotBlank(message = "Tên tour không được để trống") String name,
        String summary,
        String itinerary,
        String image,
        @Min(value = 0, message = "Giá tour không được âm") long price,
        @Min(value = 1, message = "Số ngày phải từ 1 trở lên") int durationDays,
        @NotNull(message = "Ngày khởi hành không được để trống") LocalDate startDate,
        @NotNull(message = "Ngày kết thúc không được để trống") LocalDate endDate,
        @Min(value = 1, message = "Số chỗ tối đa phải từ 1 trở lên") int maxParticipants,
        @Pattern(regexp = "OPEN|CLOSED|CANCELLED", message = "Trạng thái không hợp lệ") String status,
        List<String> landmarkIds,
        List<String> destinationIds,
        Instant createdAt) {

    /** Dùng khi tạo mới: gán createdAt, mặc định trạng thái OPEN và danh sách liên kết rỗng. */
    public Tour forCreate() {
        return normalized(null, Instant.now());
    }

    /** Dùng khi sửa: giữ nguyên createdAt cũ. */
    public Tour forUpdate(String id, Instant keepCreatedAt) {
        return normalized(id, keepCreatedAt);
    }

    private Tour normalized(String newId, Instant created) {
        return new Tour(newId, name.trim(), summary, itinerary, image, price, durationDays, startDate, endDate, maxParticipants,
                status == null ? "OPEN" : status,
                landmarkIds == null ? List.of() : landmarkIds,
                destinationIds == null ? List.of() : destinationIds,
                created);
    }
}
