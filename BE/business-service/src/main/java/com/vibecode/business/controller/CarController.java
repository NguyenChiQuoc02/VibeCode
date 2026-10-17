package com.vibecode.business.controller;

import com.vibecode.business.exception.ApiException;
import com.vibecode.business.model.Car;
import com.vibecode.business.model.PageResult;
import com.vibecode.business.repository.CarRepository;
import com.vibecode.business.security.JwtAuth;
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

/** Mẫu xe: GET công khai, ghi cần ADMIN. */
@RestController
@RequestMapping("/api/business/cars")
public class CarController {

    private final CarRepository repo;
    private final MongoTemplate mongo;
    private final JwtAuth auth;

    public CarController(CarRepository repo, MongoTemplate mongo, JwtAuth auth) {
        this.repo = repo;
        this.mongo = mongo;
        this.auth = auth;
    }

    @GetMapping
    public PageResult<Car> list(@RequestParam(required = false) String q,
                                @RequestParam(required = false) String brand,
                                @RequestParam(required = false) String bodyType,
                                @RequestParam(required = false) String fuel,
                                @RequestParam(required = false) Long minPrice,
                                @RequestParam(required = false) Long maxPrice,
                                @RequestParam(required = false) Boolean hasImage,
                                @RequestParam(required = false) Boolean featured,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);
        List<Criteria> all = new ArrayList<>();
        if (q != null && !q.isBlank()) all.add(Criteria.where("name").regex(Pattern.quote(q.trim()), "i"));
        if (brand != null && !brand.isBlank()) all.add(Criteria.where("brand").is(brand));
        if (bodyType != null && !bodyType.isBlank()) all.add(Criteria.where("bodyType").is(bodyType));
        if (fuel != null && !fuel.isBlank()) all.add(Criteria.where("fuel").is(fuel));
        if (minPrice != null) all.add(Criteria.where("price").gte(minPrice));
        if (maxPrice != null) all.add(Criteria.where("price").lte(maxPrice));
        if (Boolean.TRUE.equals(hasImage)) all.add(Criteria.where("url_image").nin(null, ""));
        if (Boolean.TRUE.equals(featured)) all.add(Criteria.where("featured").is(true));
        Query filter = all.isEmpty() ? new Query() : new Query(new Criteria().andOperator(all));
        long total = mongo.count(filter, Car.class);
        Query pageQuery = Query.of(filter).with(PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id")));
        return new PageResult<>(mongo.find(pageQuery, Car.class), total, safePage, safeSize);
    }

    /** Toàn bộ mẫu xe (mới nhất trước, bỏ mô tả) cho bảng quản trị lọc phía client, giống destinations. */
    @GetMapping("/all")
    public List<Car> all() {
        Query query = new Query().with(Sort.by(Sort.Direction.DESC, "id"));
        query.fields().exclude("description");
        return mongo.find(query, Car.class);
    }

    /** Số liệu tổng quan, kèm danh sách kiểu thân xe và nhiên liệu cho bộ lọc. */
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return Map.of(
                "total", repo.count(),
                "brands", mongo.findDistinct(new Query(), "brand", Car.class, String.class).size(),
                "bodyTypes", mongo.findDistinct(new Query(), "bodyType", Car.class, String.class).stream().sorted().toList(),
                "fuels", mongo.findDistinct(new Query(), "fuel", Car.class, String.class).stream().sorted().toList());
    }

    @GetMapping("/{id}")
    public Car get(@PathVariable String id) {
        return repo.findById(id).orElseThrow(this::notFound);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Car create(@RequestHeader(value = "Authorization", required = false) String token, @Valid @RequestBody Car body) {
        auth.requireAdmin(token);
        return repo.save(body.withId(null));
    }

    @PutMapping("/{id}")
    public Car update(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id, @Valid @RequestBody Car body) {
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

    private ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu xe");
    }
}
