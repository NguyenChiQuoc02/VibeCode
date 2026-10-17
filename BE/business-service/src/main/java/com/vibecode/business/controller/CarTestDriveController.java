package com.vibecode.business.controller;

import com.vibecode.business.exception.ApiException;
import com.vibecode.business.model.CarTestDrive;
import com.vibecode.business.repository.CarRepository;
import com.vibecode.business.repository.CarTestDriveRepository;
import com.vibecode.business.security.AuthUser;
import com.vibecode.business.security.JwtAuth;
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

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Đặt lịch lái thử. Người dùng đã đăng nhập đặt và hủy lịch của mình; ADMIN xem tất cả và đổi trạng thái. */
@RestController
@RequestMapping("/api/business/test-drives")
public class CarTestDriveController {

    private static final Set<String> STATUSES = Set.of("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED");

    private final CarTestDriveRepository repo;
    private final CarRepository cars;
    private final JwtAuth auth;

    public CarTestDriveController(CarTestDriveRepository repo, CarRepository cars, JwtAuth auth) {
        this.repo = repo;
        this.cars = cars;
        this.auth = auth;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CarTestDrive create(@RequestHeader(value = "Authorization", required = false) String token, @RequestBody Map<String, String> body) {
        AuthUser user = auth.requireUser(token);
        var car = cars.findById(text(body.get("carId"))).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu xe"));
        String name = text(body.get("fullName"));
        String phone = text(body.get("phone"));
        if (name.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng nhập họ tên");
        if (!phone.matches("[0-9+ .-]{8,15}")) throw new ApiException(HttpStatus.BAD_REQUEST, "Số điện thoại không hợp lệ");
        String date = text(body.get("preferredDate"));
        LocalDate parsed;
        try {
            parsed = LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ngày lái thử không hợp lệ");
        }
        if (parsed.isBefore(LocalDate.now())) throw new ApiException(HttpStatus.BAD_REQUEST, "Ngày lái thử phải từ hôm nay trở đi");
        return repo.save(new CarTestDrive(null, car.id(), car.name(), user.email(), name, phone, date, text(body.get("note")), "PENDING", Instant.now()));
    }

    @GetMapping("/mine")
    public List<CarTestDrive> mine(@RequestHeader(value = "Authorization", required = false) String token) {
        return repo.findByUserEmailOrderByIdDesc(auth.requireUser(token).email());
    }

    @PostMapping("/{id}/cancel")
    public CarTestDrive cancel(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id) {
        AuthUser user = auth.requireUser(token);
        CarTestDrive t = find(id);
        if (!user.isAdmin() && !user.email().equalsIgnoreCase(t.userEmail())) throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền hủy lịch này");
        if (!Set.of("PENDING", "CONFIRMED").contains(t.status())) throw new ApiException(HttpStatus.BAD_REQUEST, "Lịch này không thể hủy");
        return repo.save(t.withStatus("CANCELLED"));
    }

    @GetMapping
    public List<CarTestDrive> list(@RequestHeader(value = "Authorization", required = false) String token, @RequestParam(required = false) String status) {
        auth.requireAdmin(token);
        return status == null || status.isBlank() ? repo.findAll(Sort.by(Sort.Direction.DESC, "id")) : repo.findByStatusOrderByIdDesc(status);
    }

    @PutMapping("/{id}/status")
    public CarTestDrive setStatus(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id, @RequestBody Map<String, String> body) {
        auth.requireAdmin(token);
        String status = text(body.get("status"));
        if (!STATUSES.contains(status)) throw new ApiException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        return repo.save(find(id).withStatus(status));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = "Authorization", required = false) String token, @PathVariable String id) {
        auth.requireAdmin(token);
        repo.delete(find(id));
    }

    private CarTestDrive find(String id) {
        return repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch lái thử"));
    }

    private static String text(String s) {
        return s == null ? "" : s.trim();
    }
}
