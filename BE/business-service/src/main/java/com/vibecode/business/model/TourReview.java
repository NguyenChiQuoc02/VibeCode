package com.vibecode.business.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/** Đánh giá tour của người dùng đã hoàn thành chuyến đi; mỗi người một đánh giá cho mỗi tour. */
@Document("tour_reviews")
public record TourReview(
        @Id String id,
        String tourId,
        String bookingId,
        String userId,
        String authorName,
        int rating,
        String comment,
        Instant createdAt) {
}
