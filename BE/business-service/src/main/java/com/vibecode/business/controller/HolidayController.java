package com.vibecode.business.controller;

import com.vibecode.business.exception.ApiException;
import com.vibecode.business.model.Holiday;
import com.vibecode.business.repository.HolidayRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/business/holidays")
public class HolidayController {

    private final HolidayRepository repo;

    public HolidayController(HolidayRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Holiday> list() {
        return repo.findAll(Sort.by("month", "day"));
    }

    @GetMapping("/{id}")
    public Holiday get(@PathVariable String id) {
        return repo.findById(id).orElseThrow(this::notFound);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Holiday create(@Valid @RequestBody Holiday body) {
        return repo.save(body.withId(null));
    }

    @PutMapping("/{id}")
    public Holiday update(@PathVariable String id, @Valid @RequestBody Holiday body) {
        if (!repo.existsById(id)) throw notFound();
        return repo.save(body.withId(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        if (!repo.existsById(id)) throw notFound();
        repo.deleteById(id);
    }

    private ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy ngày lễ");
    }
}
