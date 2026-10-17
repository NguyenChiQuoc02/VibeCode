package com.vibecode.business.controller;

import com.vibecode.business.exception.ApiException;
import com.vibecode.business.model.CarBrand;
import com.vibecode.business.repository.CarBrandRepository;
import com.vibecode.business.security.JwtAuth;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
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

/** Hãng xe: GET công khai (nhiều xe nhất lên trước), ghi cần ADMIN. */
@RestController
@RequestMapping("/api/business/car-brands")
public class CarBrandController {

    private final CarBrandRepository repo;
    private final JwtAuth auth;

    public CarBrandController(CarBrandRepository repo, JwtAuth auth) {
        this.repo = repo;
        this.auth = auth;
    }

    @GetMapping
    public List<CarBrand> list(@RequestParam(defaultValue = "0") int limit) {
        List<CarBrand> all = repo.findAll(Sort.by(Sort.Direction.DESC, "carCount"));
        return limit > 0 && all.size() > limit ? all.subList(0, limit) : all;
    }

    @GetMapping("/{id}")
    public CarBrand get(@PathVariable String id) {
        return repo.findById(id).orElseThrow(this::notFound);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CarBrand create(@RequestHeader(value = "Authorization", required = false) String token, @Valid @RequestBody CarBrand body) {
        auth.requireAdmin(token);
        return repo.save(body.withId(null));
    }

    @PutMapping("/{id}")
    public CarBrand update(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id, @Valid @RequestBody CarBrand body) {
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
        return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy hãng xe");
    }
}
