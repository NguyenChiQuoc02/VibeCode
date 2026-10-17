package com.vibecode.business.controller;

import com.vibecode.business.repository.DestinationRepository;
import com.vibecode.business.repository.LandmarkRepository;
import com.vibecode.business.repository.ProvinceRepository;
import com.vibecode.business.repository.TourRepository;
import com.vibecode.business.repository.TourReviewRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

/** Số liệu tổng quan công khai (đếm số bản ghi) cho trang Về chúng tôi. */
@RestController
@RequestMapping("/api/business/overview")
public class OverviewController {

    private final LandmarkRepository landmarks;
    private final DestinationRepository destinations;
    private final ProvinceRepository provinces;
    private final TourRepository tours;
    private final TourReviewRepository reviews;

    public OverviewController(LandmarkRepository landmarks, DestinationRepository destinations, ProvinceRepository provinces,
                              TourRepository tours, TourReviewRepository reviews) {
        this.landmarks = landmarks;
        this.destinations = destinations;
        this.provinces = provinces;
        this.tours = tours;
        this.reviews = reviews;
    }

    @GetMapping
    public ResponseEntity<Map<String, Long>> overview() {
        Map<String, Long> out = new LinkedHashMap<>();
        out.put("landmarks", landmarks.count());
        out.put("destinations", destinations.count());
        out.put("provinces", provinces.count());
        out.put("tours", tours.count());
        out.put("reviews", reviews.count());
        return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic()).body(out);
    }
}
