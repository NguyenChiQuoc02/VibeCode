package com.vibecode.business.controller;

import com.vibecode.business.exception.ApiException;
import com.vibecode.business.security.JwtAuth;
import com.vibecode.business.model.Landmark;
import com.vibecode.business.model.PageResult;
import com.vibecode.business.repository.LandmarkRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/business/landmarks")
public class LandmarkController {

    private final LandmarkRepository repo;
    private final MongoTemplate mongo;
    private final JwtAuth auth;

    public LandmarkController(LandmarkRepository repo, MongoTemplate mongo, JwtAuth auth) {
        this.auth = auth;
        this.repo = repo;
        this.mongo = mongo;
    }

    /** Danh sách có lọc và phân trang. Không trả các trường nặng (detail, images, highlights). */
    @GetMapping
    public PageResult<Landmark> list(@RequestParam(required = false) String q,
                                     @RequestParam(required = false) Integer provinceCode,
                                     @RequestParam(required = false) String status,
                                     @RequestParam(required = false) String category,
                                     @RequestParam(required = false) String level,
                                     @RequestParam(required = false) Boolean hasImage,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);

        List<Criteria> all = new ArrayList<>();
        if (q != null && !q.isBlank()) all.add(Criteria.where("name").regex(Pattern.quote(q.trim()), "i"));
        if (provinceCode != null) all.add(Criteria.where("provinceCode").is(provinceCode));
        if (status != null && !status.isBlank()) all.add(Criteria.where("status").is(status));
        if (category != null && !category.isBlank()) all.add(Criteria.where("category").is(category));
        if (level != null && !level.isBlank()) all.add(Criteria.where("recognitionLevel").is(level));
        if (Boolean.TRUE.equals(hasImage)) all.add(Criteria.where("url_image").nin(null, ""));
        Query filter = all.isEmpty() ? new Query() : new Query(new Criteria().andOperator(all));

        long total = mongo.count(filter, Landmark.class);
        Query pageQuery = Query.of(filter).with(PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id")));
        pageQuery.fields().exclude("detail", "images", "highlights");
        return new PageResult<>(mongo.find(pageQuery, Landmark.class), total, safePage, safeSize);
    }

    /** Số lượng theo trạng thái cho các thẻ thống kê. */
    @GetMapping("/stats")
    public Map<String, Long> stats() {
        return Map.of(
                "total", repo.count(),
                "active", count("ACTIVE"),
                "paused", count("PAUSED"),
                "deleted", count("DELETED"));
    }

    /** Dữ liệu tối giản để vẽ marker trên bản đồ (bỏ các bản ghi đã xóa hoặc chưa có tọa độ). */
    @GetMapping("/markers")
    public List<Landmark> markers() {
        Query query = new Query(Criteria.where("status").ne("DELETED").and("latitude").ne(null).and("longitude").ne(null));
        query.fields().include("name", "category", "provinceCode", "address", "latitude", "longitude");
        return mongo.find(query, Landmark.class);
    }

    @GetMapping("/{id}")
    public Landmark get(@PathVariable String id) {
        return repo.findById(id).orElseThrow(this::notFound);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Landmark create(@RequestHeader(value = "Authorization", required = false) String token, @Valid @RequestBody Landmark body) {
        auth.requireAdmin(token);
        return repo.save(body.withId(null));
    }

    @PutMapping("/{id}")
    public Landmark update(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id, @Valid @RequestBody Landmark body) {
        auth.requireAdmin(token);
        if (!repo.existsById(id)) throw notFound();
        return repo.save(body.withId(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id) {
        auth.requireAdmin(token);
        if (!repo.existsById(id)) throw notFound();
        repo.deleteById(id);
    }

    private long count(String status) {
        return mongo.count(new Query(Criteria.where("status").is(status)), Landmark.class);
    }

    private ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy địa danh");
    }
}
