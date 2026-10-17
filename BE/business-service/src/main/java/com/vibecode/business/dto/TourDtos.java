package com.vibecode.business.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Các dữ liệu vào/ra của API tour. */
public final class TourDtos {

    private TourDtos() {
    }

    /** Tóm tắt một địa điểm được liên kết với tour. */
    public record PlaceRef(String id, String name, String address, String image) {
    }

    public record TourView(
            String id,
            String name,
            String summary,
            String itinerary,
            String image,
            long price,
            int durationDays,
            LocalDate startDate,
            LocalDate endDate,
            int maxParticipants,
            String status,
            List<String> landmarkIds,
            List<String> destinationIds,
            List<PlaceRef> landmarks,
            List<PlaceRef> destinations,
            double avgRating,
            int reviewCount,
            int bookedSeats,
            Instant createdAt) {
    }

    public record BookingRequest(
            @NotBlank(message = "Vui lòng nhập họ tên người liên hệ") String contactName,
            @NotBlank(message = "Vui lòng nhập số điện thoại") @Pattern(regexp = "^[0-9+\\s.-]{8,15}$", message = "Số điện thoại không hợp lệ") String phone,
            @Min(value = 1, message = "Số người phải từ 1 trở lên") @Max(value = 50, message = "Mỗi lần đăng ký tối đa 50 người") int participants,
            String note) {
    }

    /** Đăng ký tour kèm thông tin tour để hiển thị trong danh sách. */
    public record BookingView(
            String id,
            String tourId,
            String tourName,
            String tourImage,
            LocalDate startDate,
            LocalDate endDate,
            String tourStatus,
            String userEmail,
            String contactName,
            String phone,
            int participants,
            long totalAmount,
            String note,
            String status,
            String paymentStatus,
            Instant paidAt,
            Instant createdAt,
            boolean hasReview) {
    }

    public record ReviewRequest(
            @Min(value = 1, message = "Điểm đánh giá từ 1 đến 5") @Max(value = 5, message = "Điểm đánh giá từ 1 đến 5") int rating,
            String comment) {
    }

    public record ReviewView(String id, String authorName, int rating, String comment, Instant createdAt, boolean mine) {
    }
}
