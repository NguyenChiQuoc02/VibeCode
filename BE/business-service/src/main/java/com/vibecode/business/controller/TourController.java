package com.vibecode.business.controller;

import com.vibecode.business.dto.TourDtos.BookingRequest;
import com.vibecode.business.dto.TourDtos.BookingView;
import com.vibecode.business.dto.TourDtos.ReviewRequest;
import com.vibecode.business.dto.TourDtos.ReviewView;
import com.vibecode.business.dto.TourDtos.TourView;
import com.vibecode.business.model.Tour;
import com.vibecode.business.security.JwtAuth;
import com.vibecode.business.service.TourService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Xem tour và đánh giá là công khai; thêm/sửa/xóa cần ADMIN; đăng ký và đánh giá cần đăng nhập. */
@RestController
@RequestMapping("/api/business/tours")
public class TourController {

    private final TourService service;
    private final JwtAuth auth;

    public TourController(TourService service, JwtAuth auth) {
        this.service = service;
        this.auth = auth;
    }

    @GetMapping
    public List<TourView> list(@RequestParam(required = false) String q, @RequestParam(required = false) String status,
                               @RequestParam(defaultValue = "false") boolean upcoming, @RequestParam(required = false) String placeId,
                               @RequestParam(required = false) Integer limit) {
        return service.list(q, status, upcoming, placeId, limit);
    }

    @GetMapping("/{id}")
    public TourView get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TourView create(@RequestHeader(value = "Authorization", required = false) String token, @Valid @RequestBody Tour body) {
        auth.requireAdmin(token);
        return service.create(body);
    }

    @PutMapping("/{id}")
    public TourView update(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id, @Valid @RequestBody Tour body) {
        auth.requireAdmin(token);
        return service.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id) {
        auth.requireAdmin(token);
        service.delete(id);
    }

    @PostMapping("/{id}/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingView register(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id, @Valid @RequestBody BookingRequest body) {
        return service.register(auth.requireUser(token), id, body);
    }

    @GetMapping("/{id}/reviews")
    public List<ReviewView> reviews(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id) {
        return service.reviews(id, auth.optional(token));
    }

    @PostMapping("/{id}/reviews")
    public ReviewView review(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id, @Valid @RequestBody ReviewRequest body) {
        return service.review(auth.requireUser(token), id, body);
    }
}
