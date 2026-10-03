package com.vibecode.business.controller;

import com.vibecode.business.exception.ApiException;
import com.vibecode.business.model.Province;
import com.vibecode.business.model.Ward;
import com.vibecode.business.repository.ProvinceRepository;
import com.vibecode.business.repository.WardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Dữ liệu hành chính (tỉnh/thành, xã/phường) và ranh giới polygon (GeoJSON) để hiển thị bản đồ. */
@RestController
@RequestMapping("/api/business")
public class GeoController {

    private final ProvinceRepository provinces;
    private final WardRepository wards;

    public GeoController(ProvinceRepository provinces, WardRepository wards) {
        this.provinces = provinces;
        this.wards = wards;
    }

    /** Danh sách tỉnh, không kèm polygon. Thêm geometry=true để lấy cả ranh giới. */
    @GetMapping("/provinces")
    public List<Province> provinces(@RequestParam(defaultValue = "false") boolean geometry) {
        return geometry ? provinces.findAll() : provinces.findAllLight();
    }

    @GetMapping("/provinces/{code}")
    public Province province(@PathVariable int code) {
        return provinces.findByCode(code)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tỉnh/thành"));
    }

    /** Danh sách xã/phường của một tỉnh. Thêm geometry=true để lấy cả polygon. */
    @GetMapping("/wards")
    public List<Ward> wards(@RequestParam int provinceCode, @RequestParam(defaultValue = "false") boolean geometry) {
        return geometry ? wards.findByProvinceCode(provinceCode) : wards.findLightByProvinceCode(provinceCode);
    }

    @GetMapping("/wards/{code}")
    public Ward ward(@PathVariable int code) {
        return wards.findByCode(code)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy xã/phường"));
    }
}
