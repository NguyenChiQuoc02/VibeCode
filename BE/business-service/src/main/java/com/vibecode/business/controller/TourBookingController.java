package com.vibecode.business.controller;

import com.vibecode.business.dto.TourDtos.BookingView;
import com.vibecode.business.security.JwtAuth;
import com.vibecode.business.service.TourService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Đăng ký tour của người dùng (mine, cancel) và quản lý của admin (list, complete). */
@RestController
@RequestMapping("/api/business/bookings")
public class TourBookingController {

    private final TourService service;
    private final JwtAuth auth;

    public TourBookingController(TourService service, JwtAuth auth) {
        this.service = service;
        this.auth = auth;
    }

    @GetMapping("/mine")
    public List<BookingView> mine(@RequestHeader(value = "Authorization", required = false) String token) {
        return service.mine(auth.requireUser(token));
    }

    @PostMapping("/{id}/cancel")
    public BookingView cancel(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id) {
        return service.cancel(auth.requireUser(token), id);
    }

    @GetMapping
    public List<BookingView> list(@RequestHeader(value = "Authorization", required = false) String token,
                                  @RequestParam(required = false) String tourId, @RequestParam(required = false) String status) {
        auth.requireAdmin(token);
        return service.adminList(tourId, status);
    }

    /** Xác nhận đã hoàn thành chuyến đi và thu tiền mặt. */
    @PostMapping("/{id}/complete")
    public BookingView complete(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id) {
        auth.requireAdmin(token);
        return service.complete(id);
    }
}
