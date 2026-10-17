package com.vibecode.business.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/** Lịch hẹn lái thử. status: PENDING | CONFIRMED | COMPLETED | CANCELLED. Người dùng định danh bằng email. */
@Document("car_test_drives")
public record CarTestDrive(
        @Id String id,
        String carId,
        String carName,
        String userEmail,
        String fullName,
        String phone,
        String preferredDate,
        String note,
        String status,
        Instant createdAt) {

    public CarTestDrive withStatus(String s) {
        return new CarTestDrive(id, carId, carName, userEmail, fullName, phone, preferredDate, note, s, createdAt);
    }
}
