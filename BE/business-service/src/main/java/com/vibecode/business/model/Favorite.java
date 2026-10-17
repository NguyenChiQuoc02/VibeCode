package com.vibecode.business.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/** Mục yêu thích của người dùng. type: TOUR | DESTINATION | LANDMARK. Mỗi người chỉ có một bản ghi cho mỗi (type, targetId). */
@Document("favorites")
public record Favorite(
        @Id String id,
        String userId,
        String type,
        String targetId,
        Instant createdAt) {
}
