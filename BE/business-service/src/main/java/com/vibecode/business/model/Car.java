package com.vibecode.business.model;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/** Mẫu xe hơi. price tính bằng đồng; priceEstimated = true khi giá là ước tính theo phân khúc, không phải giá niêm yết. */
@Document("cars")
public record Car(
        @Id String id,
        @NotBlank(message = "Tên xe không được để trống") String name,
        @NotBlank(message = "Hãng xe không được để trống") String brand,
        String model,
        String bodyType,
        String country,
        Integer year,
        String fuel,
        String transmission,
        Integer seats,
        Long price,
        boolean priceEstimated,
        boolean featured,
        String description,
        @Field("url_image") String urlImage,
        String source,
        @Field("source_id") String sourceId) {

    public Car withId(String newId) {
        return new Car(newId, name, brand, model, bodyType, country, year, fuel, transmission, seats, price, priceEstimated, featured, description, urlImage, source, sourceId);
    }
}
