package com.vibecode.business.controller;

import com.vibecode.business.exception.ApiException;
import com.vibecode.business.security.JwtAuth;
import com.vibecode.business.model.MenuConfig;
import com.vibecode.business.repository.MenuConfigRepository;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/business/menus")
public class MenuConfigController {

    private final MenuConfigRepository repo;
    private final JwtAuth auth;

    public MenuConfigController(MenuConfigRepository repo, JwtAuth auth) {
        this.auth = auth;
        this.repo = repo;
    }

    @GetMapping
    public List<MenuConfig> list() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @GetMapping("/{id}")
    public MenuConfig get(@PathVariable String id) {
        return repo.findById(id).orElseThrow(this::notFound);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MenuConfig create(@RequestHeader(value = "Authorization", required = false) String token, @Valid @RequestBody MenuConfig raw) {
        auth.requireAdmin(token);
        MenuConfig body = raw.normalized();
        validate(body, null);
        return repo.save(body.withId(null));
    }

    @PutMapping("/{id}")
    public MenuConfig update(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id, @Valid @RequestBody MenuConfig raw) {
        auth.requireAdmin(token);
        MenuConfig body = raw.normalized();
        MenuConfig current = repo.findById(id).orElseThrow(this::notFound);
        if (current.isProtected() && (!body.visible() || !body.isProtected() || body.parentId() != null)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Không thể ẩn, đổi đường dẫn hoặc đưa menu Cấu hình menu vào nhóm khác");
        }
        validate(body, id);
        // Nhóm đang có menu con thì không được đổi thành trang (có đường dẫn) hoặc đưa vào nhóm khác.
        if (current.isGroup() && hasChildren(id) && (!body.isGroup() || body.parentId() != null)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nhóm đang có menu con, hãy chuyển hoặc xóa các menu con trước");
        }
        return repo.save(body.withId(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id) {
        auth.requireAdmin(token);
        MenuConfig current = repo.findById(id).orElseThrow(this::notFound);
        if (current.isProtected()) throw new ApiException(HttpStatus.BAD_REQUEST, "Không thể xóa menu Cấu hình menu");
        if (current.isGroup() && hasChildren(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nhóm đang có menu con, hãy chuyển hoặc xóa các menu con trước");
        }
        repo.deleteById(id);
    }

    private boolean hasChildren(String id) {
        return repo.findAll().stream().anyMatch(m -> id.equals(m.parentId()));
    }

    /** Menu con phải có đường dẫn và nằm trong một nhóm có sẵn; chỉ có hai cấp. */
    private void validate(MenuConfig m, String selfId) {
        if (m.parentId() == null) return;
        if (m.parentId().equals(selfId)) throw new ApiException(HttpStatus.BAD_REQUEST, "Menu không thể là menu cha của chính nó");
        if (m.isGroup()) throw new ApiException(HttpStatus.BAD_REQUEST, "Menu con phải có đường dẫn (nhóm không được nằm trong nhóm khác)");
        MenuConfig parent = repo.findById(m.parentId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Menu cha không tồn tại"));
        if (!parent.isGroup()) throw new ApiException(HttpStatus.BAD_REQUEST, "Menu cha phải là nhóm (không có đường dẫn)");
    }

    private ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy menu");
    }
}
