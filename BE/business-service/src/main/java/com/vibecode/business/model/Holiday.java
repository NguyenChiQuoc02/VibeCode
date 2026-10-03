package com.vibecode.business.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** calendar: SOLAR | LUNAR. category: PUBLIC | TRADITIONAL | INTERNATIONAL. */
@Document("holidays")
public record Holiday(
        @Id String id,
        @NotBlank(message = "Tên ngày lễ không được để trống") String name,
        @Pattern(regexp = "SOLAR|LUNAR", message = "Loại lịch phải là SOLAR hoặc LUNAR") String calendar,
        @Min(value = 1, message = "Ngày phải từ 1 đến 31") @Max(value = 31, message = "Ngày phải từ 1 đến 31") int day,
        @Min(value = 1, message = "Tháng phải từ 1 đến 12") @Max(value = 12, message = "Tháng phải từ 1 đến 12") int month,
        @Pattern(regexp = "PUBLIC|TRADITIONAL|INTERNATIONAL", message = "Phân loại không hợp lệ") String category,
        boolean dayOff,
        String description) {

    public Holiday withId(String newId) {
        return new Holiday(newId, name, calendar, day, month, category, dayOff, description);
    }
}
