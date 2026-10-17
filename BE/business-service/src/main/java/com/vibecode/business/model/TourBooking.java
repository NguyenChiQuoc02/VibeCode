package com.vibecode.business.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Đăng ký tour của người dùng. Thanh toán bằng tiền mặt sau khi tour kết thúc.
 * status: REGISTERED | CANCELLED | COMPLETED. paymentStatus: UNPAID | PAID.
 */
@Document("tour_bookings")
public record TourBooking(
        @Id String id,
        String tourId,
        String userId,
        String userEmail,
        String contactName,
        String phone,
        int participants,
        long totalAmount,
        String note,
        String status,
        String paymentStatus,
        Instant paidAt,
        Instant createdAt) {

    public TourBooking cancelled() {
        return new TourBooking(id, tourId, userId, userEmail, contactName, phone, participants, totalAmount, note, "CANCELLED", paymentStatus, paidAt, createdAt);
    }

    /** Hoàn thành chuyến đi và đã thu tiền mặt. */
    public TourBooking completedAndPaid(Instant at) {
        return new TourBooking(id, tourId, userId, userEmail, contactName, phone, participants, totalAmount, note, "COMPLETED", "PAID", at, createdAt);
    }
}
