package com.vibecode.business.controller;

import com.vibecode.business.exception.ApiException;
import com.vibecode.business.model.Destination;
import com.vibecode.business.repository.DestinationRepository;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/business/destinations")
public class DestinationController {

    private final DestinationRepository repo;

    public DestinationController(DestinationRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Destination> list(@RequestParam(required = false) Integer provinceCode) {
        Sort sort = Sort.by("name");
        return provinceCode == null ? repo.findAll(sort) : repo.findByProvinceCode(provinceCode, sort);
    }

    @GetMapping("/{id}")
    public Destination get(@PathVariable String id) {
        return repo.findById(id).orElseThrow(this::notFound);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Destination create(@Valid @RequestBody Destination body) {
        return repo.save(body.withId(null));
    }

    @PutMapping("/{id}")
    public Destination update(@PathVariable String id, @Valid @RequestBody Destination body) {
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
        return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm du lịch");
    }
}
