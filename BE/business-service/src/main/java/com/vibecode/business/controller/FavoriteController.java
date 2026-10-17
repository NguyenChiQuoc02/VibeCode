package com.vibecode.business.controller;

import com.vibecode.business.dto.FavoriteDtos.FavoriteView;
import com.vibecode.business.security.JwtAuth;
import com.vibecode.business.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Yêu thích của người dùng đang đăng nhập (tour, địa điểm du lịch, di tích). */
@RestController
@RequestMapping("/api/business/favorites")
public class FavoriteController {

    private final FavoriteService service;
    private final JwtAuth auth;

    public FavoriteController(FavoriteService service, JwtAuth auth) {
        this.service = service;
        this.auth = auth;
    }

    @GetMapping
    public List<FavoriteView> list(@RequestHeader(value = "Authorization", required = false) String token) {
        return service.list(auth.requireUser(token));
    }

    /** Khóa dạng "TOUR:abc" của mọi mục đã yêu thích. */
    @GetMapping("/keys")
    public List<String> keys(@RequestHeader(value = "Authorization", required = false) String token) {
        return service.keys(auth.requireUser(token));
    }

    @PutMapping("/{type}/{targetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void add(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String type, @PathVariable String targetId) {
        service.add(auth.requireUser(token), type.toUpperCase(), targetId);
    }

    @DeleteMapping("/{type}/{targetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String type, @PathVariable String targetId) {
        service.remove(auth.requireUser(token), type.toUpperCase(), targetId);
    }
}
