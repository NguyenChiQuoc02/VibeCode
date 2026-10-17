package com.vibecode.business.model;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/** Hãng xe. carCount là số mẫu xe lúc nạp dữ liệu. */
@Document("car_brands")
public record CarBrand(
        @Id String id,
        @NotBlank(message = "Tên hãng không được để trống") String name,
        String country,
        String description,
        @Field("url_image") String urlImage,
        int carCount) {

    public CarBrand withId(String newId) {
        return new CarBrand(newId, name, country, description, urlImage, carCount);
    }
}
