package com.vibecode.business.controller;

import com.vibecode.business.security.JwtAuth;
import com.vibecode.business.stats.StatsService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

/** Số liệu thống kê lấy từ Superset để FE tự vẽ biểu đồ. Chỉ dành cho ADMIN. */
@RestController
@RequestMapping("/api/business/stats")
public class StatsController {

    private final StatsService stats;
    private final JwtAuth auth;

    public StatsController(StatsService stats, JwtAuth auth) {
        this.stats = stats;
        this.auth = auth;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StatsService.Dashboard> dashboard(@RequestHeader(value = "Authorization", required = false) String token) {
        auth.requireAdmin(token);
        return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofSeconds(30)).cachePrivate()).body(stats.dashboard());
    }
}
