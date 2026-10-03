package com.vibecode.business.model;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

/**
 * Di tích, danh lam thắng cảnh.
 * status: ACTIVE | PAUSED | DELETED (xóa mềm).
 * recognitionLevel: Quốc tế | Quốc gia đặc biệt | Quốc gia | Tỉnh/Thành phố.
 */
@Document("landmarks")
public record Landmark(
        @Id String id,
        @NotBlank(message = "Tên địa danh không được để trống") String name,
        @NotBlank(message = "Phân loại không được để trống") String category,
        int provinceCode,
        String address,
        @DecimalMin(value = "-90", message = "Vĩ độ không hợp lệ") @DecimalMax(value = "90", message = "Vĩ độ không hợp lệ") double latitude,
        @DecimalMin(value = "-180", message = "Kinh độ không hợp lệ") @DecimalMax(value = "180", message = "Kinh độ không hợp lệ") double longitude,
        String recognitionLevel,
        Integer recognitionYear,
        Double areaKm2,
        @Pattern(regexp = "ACTIVE|PAUSED|DELETED", message = "Trạng thái không hợp lệ") String status,
        @NotBlank(message = "Mô tả ngắn không được để trống") String description,
        String detail,
        List<String> highlights,
        List<String> images,
        @Field("url_image") String urlImage,
        String source,
        @Field("source_id") String sourceId) {

    public Landmark withId(String newId) {
        return new Landmark(newId, name, category, provinceCode, address, latitude, longitude, recognitionLevel, recognitionYear, areaKm2, status, description, detail, highlights, images, urlImage, source, sourceId);
    }
}
