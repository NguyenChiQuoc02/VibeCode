package com.vibecode.business.controller;

import com.vibecode.business.exception.ApiException;
import com.vibecode.business.security.JwtAuth;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/business/destinations")
public class DestinationController {

    private final DestinationRepository repo;
    private final JwtAuth auth;

    public DestinationController(DestinationRepository repo, JwtAuth auth) {
        this.auth = auth;
        this.repo = repo;
    }

    @GetMapping
    /**
     * Lọc kết hợp: provinceCode, q (tên chứa chuỗi, không phân biệt hoa thường), type (loại hình).
     * offset/limit để phân trang (trang khám phá, ô chọn địa điểm của tour). Không truyền thì trả toàn bộ như trước.
     */
    public List<Destination> list(@RequestParam(required = false) Integer provinceCode, @RequestParam(required = false) String q,
                                  @RequestParam(required = false) String type, @RequestParam(required = false) Boolean hasImage,
                                  @RequestParam(required = false) Integer offset,
                                  @RequestParam(required = false) Integer limit) {
        Sort sort = Sort.by(Sort.Direction.DESC, "id");
        String needle = q == null ? "" : q.trim().toLowerCase();
        var stream = (provinceCode == null ? repo.findAll(sort) : repo.findByProvinceCode(provinceCode, sort)).stream()
                .filter(d -> needle.isEmpty() || d.name().toLowerCase().contains(needle))
                .filter(d -> type == null || type.isBlank() || type.equals(d.type()))
                .filter(d -> !Boolean.TRUE.equals(hasImage) || (d.urlImage() != null && !d.urlImage().isBlank()));
        if (offset != null && offset > 0) stream = stream.skip(offset);
        if (limit != null && limit > 0) stream = stream.limit(limit);
        return stream.toList();
    }

    @GetMapping("/{id}")
    public Destination get(@PathVariable String id) {
        return repo.findById(id).orElseThrow(this::notFound);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Destination create(@RequestHeader(value = "Authorization", required = false) String token, @Valid @RequestBody Destination body) {
        auth.requireAdmin(token);
        return repo.save(body.withId(null));
    }

    @PutMapping("/{id}")
    public Destination update(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id, @Valid @RequestBody Destination body) {
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
        return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm du lịch");
    }
}
