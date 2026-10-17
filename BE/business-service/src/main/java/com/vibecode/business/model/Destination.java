package com.vibecode.business.model;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/** Địa điểm du lịch. */
@Document("destinations")
public record Destination(
        @Id String id,
        @NotBlank(message = "Tên địa điểm không được để trống") String name,
        @NotBlank(message = "Loại hình không được để trống") String type,
        int provinceCode,
        String address,
        Double latitude,
        Double longitude,
        String bestSeason,
        String description,
        @Field("url_image") String urlImage,
        String source,
        @Field("source_id") String sourceId) {

    public Destination withId(String newId) {
        return new Destination(newId, name, type, provinceCode, address, latitude, longitude, bestSeason, description, urlImage, source, sourceId);
    }
}
