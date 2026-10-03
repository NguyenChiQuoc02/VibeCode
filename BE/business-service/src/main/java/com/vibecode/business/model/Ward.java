package com.vibecode.business.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Document("wards")
public record Ward(
        @Id String id,
        int code,
        String name,
        @Field("division_type") String divisionType,
        String codename,
        @Field("province_code") int provinceCode,
        List<Double> bbox,
        List<Double> center,
        Map<String, Object> geometry) {
}
