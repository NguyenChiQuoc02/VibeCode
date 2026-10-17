package com.vibecode.business.service;

import com.vibecode.business.dto.TourDtos.BookingRequest;
import com.vibecode.business.dto.TourDtos.BookingView;
import com.vibecode.business.dto.TourDtos.PlaceRef;
import com.vibecode.business.dto.TourDtos.ReviewRequest;
import com.vibecode.business.dto.TourDtos.ReviewView;
import com.vibecode.business.dto.TourDtos.TourView;
import com.vibecode.business.exception.ApiException;
import com.vibecode.business.model.Tour;
import com.vibecode.business.model.TourBooking;
import com.vibecode.business.model.TourReview;
import com.vibecode.business.repository.TourBookingRepository;
import com.vibecode.business.repository.TourRepository;
import com.vibecode.business.repository.TourReviewRepository;
import com.vibecode.business.security.AuthUser;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TourService {

    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    /** Đăng ký còn hiệu lực (chiếm chỗ). */
    private static final List<String> HOLDING = List.of("REGISTERED", "COMPLETED");
    private static final Sort NEWEST = Sort.by(Sort.Direction.DESC, "id");

    private final TourRepository tours;
    private final TourBookingRepository bookings;
    private final TourReviewRepository reviews;
    private final MongoTemplate mongo;

    public TourService(TourRepository tours, TourBookingRepository bookings, TourReviewRepository reviews, MongoTemplate mongo) {
        this.tours = tours;
        this.bookings = bookings;
        this.reviews = reviews;
        this.mongo = mongo;
    }

    private static LocalDate today() {
        return LocalDate.now(ZONE);
    }

    // ---------- Tour ----------

    /**
     * Danh sách tour (bản gọn: không kèm lịch trình). upcoming = chỉ tour đang mở nhận đăng ký và chưa khởi hành,
     * xếp theo ngày khởi hành gần nhất; limit giới hạn số tour trả về.
     */
    public List<TourView> list(String q, String status, boolean upcoming, String placeId, Integer limit) {
        String needle = q == null ? "" : q.trim().toLowerCase();
        LocalDate today = today();
        var stream = tours.findAll(NEWEST).stream()
                .filter(t -> status == null || status.isBlank() || status.equals(t.status()))
                .filter(t -> needle.isEmpty() || t.name().toLowerCase().contains(needle))
                .filter(t -> placeId == null || placeId.isBlank() || t.landmarkIds().contains(placeId) || t.destinationIds().contains(placeId))
                .filter(t -> !upcoming || ("OPEN".equals(t.status()) && !t.startDate().isBefore(today)));
        if (upcoming) stream = stream.sorted(Comparator.comparing(Tour::startDate));
        if (limit != null && limit > 0) stream = stream.limit(limit);
        return views(stream.toList(), true);
    }

    public TourView get(String id) {
        return view(find(id));
    }

    private TourView view(Tour t) {
        return views(List.of(t), false).get(0);
    }

    public TourView create(Tour body) {
        checkDates(body);
        return view(tours.save(body.forCreate()));
    }

    public TourView update(String id, Tour body) {
        Tour current = find(id);
        checkDates(body);
        return view(tours.save(body.forUpdate(id, current.createdAt())));
    }

    public void delete(String id) {
        find(id);
        if (bookings.existsByTourId(id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Tour đã có người đăng ký, hãy chuyển sang trạng thái Đã đóng hoặc Đã hủy thay vì xóa");
        }
        reviews.deleteAll(reviews.findByTourId(id, NEWEST));
        tours.deleteById(id);
    }

    private void checkDates(Tour t) {
        if (t.endDate().isBefore(t.startDate())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ngày kết thúc không được trước ngày khởi hành");
        }
    }

    private Tour find(String id) {
        return tours.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tour"));
    }

    /** Dựng TourView cho nhiều tour cùng lúc, mỗi loại dữ liệu chỉ truy vấn một lần (tránh N+1). */
    private List<TourView> views(List<Tour> list, boolean lite) {
        Set<String> landmarkIds = new LinkedHashSet<>();
        Set<String> destinationIds = new LinkedHashSet<>();
        for (Tour t : list) {
            landmarkIds.addAll(t.landmarkIds());
            destinationIds.addAll(t.destinationIds());
        }
        // Bản gọn (danh sách) chỉ trả ID địa điểm; chi tiết tên, ảnh chỉ nạp ở trang chi tiết.
        Map<String, PlaceRef> landmarkRefs = lite ? Map.of() : placeRefs("landmarks", landmarkIds);
        Map<String, PlaceRef> destinationRefs = lite ? Map.of() : placeRefs("destinations", destinationIds);

        Set<String> tourIds = new HashSet<>();
        list.forEach(t -> tourIds.add(t.id()));
        Map<String, List<TourReview>> reviewsByTour = new HashMap<>();
        for (TourReview r : reviews.findAll()) {
            if (tourIds.contains(r.tourId())) reviewsByTour.computeIfAbsent(r.tourId(), k -> new ArrayList<>()).add(r);
        }
        Map<String, Integer> seats = new HashMap<>();
        for (TourBooking b : bookings.findByStatusIn(HOLDING)) {
            if (tourIds.contains(b.tourId())) seats.merge(b.tourId(), b.participants(), Integer::sum);
        }

        return list.stream().map(t -> {
            List<TourReview> rs = reviewsByTour.getOrDefault(t.id(), List.of());
            double avg = rs.stream().mapToInt(TourReview::rating).average().orElse(0);
            return new TourView(t.id(), t.name(), t.summary(), lite ? null : t.itinerary(), t.image(), t.price(), t.durationDays(),
                    t.startDate(), t.endDate(), t.maxParticipants(), t.status(), t.landmarkIds(), t.destinationIds(),
                    refs(t.landmarkIds(), landmarkRefs), refs(t.destinationIds(), destinationRefs),
                    Math.round(avg * 10) / 10.0, rs.size(), seats.getOrDefault(t.id(), 0), t.createdAt());
        }).toList();
    }

    private static List<PlaceRef> refs(List<String> ids, Map<String, PlaceRef> byId) {
        return ids.stream().map(byId::get).filter(r -> r != null).toList();
    }

    /** Chỉ lấy các trường cần hiển thị (tên, địa chỉ, ảnh), không tải mô tả dài của địa điểm. */
    private Map<String, PlaceRef> placeRefs(String collection, Collection<String> ids) {
        Map<String, PlaceRef> out = new HashMap<>();
        if (ids.isEmpty()) return out;
        List<Object> keys = ids.stream().map(id -> ObjectId.isValid(id) ? (Object) new ObjectId(id) : id).toList();
        Query query = new Query(Criteria.where("_id").in(keys));
        query.fields().include("name", "address", "url_image");
        for (Document d : mongo.find(query, Document.class, collection)) {
            String id = String.valueOf(d.get("_id"));
            out.put(id, new PlaceRef(id, d.getString("name"), d.getString("address"), d.getString("url_image")));
        }
        return out;
    }

    private int bookedSeats(String tourId) {
        return bookings.findByTourIdAndStatusIn(tourId, HOLDING).stream().mapToInt(TourBooking::participants).sum();
    }

    // ---------- Đăng ký tour ----------

    public BookingView register(AuthUser user, String tourId, BookingRequest req) {
        Tour tour = find(tourId);
        if (!"OPEN".equals(tour.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tour này hiện không nhận đăng ký");
        }
        if (tour.startDate().isBefore(today())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tour đã khởi hành, không thể đăng ký");
        }
        if (bookings.findFirstByTourIdAndUserIdAndStatusIn(tourId, user.id(), HOLDING).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Bạn đã đăng ký tour này rồi");
        }
        int left = tour.maxParticipants() - bookedSeats(tourId);
        if (req.participants() > left) {
            throw new ApiException(HttpStatus.CONFLICT, left <= 0 ? "Tour đã hết chỗ" : "Tour chỉ còn " + left + " chỗ");
        }
        TourBooking saved = bookings.save(new TourBooking(null, tourId, user.id(), user.email(), req.contactName().trim(), req.phone().trim(),
                req.participants(), tour.price() * req.participants(), req.note(), "REGISTERED", "UNPAID", null, Instant.now()));
        return bookingView(saved, tour);
    }

    public List<BookingView> mine(AuthUser user) {
        return bookings.findByUserId(user.id(), NEWEST).stream().map(b -> bookingView(b, tours.findById(b.tourId()).orElse(null))).toList();
    }

    public BookingView cancel(AuthUser user, String bookingId) {
        TourBooking b = findBooking(bookingId);
        if (!b.userId().equals(user.id()) && !user.isAdmin()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền hủy đăng ký này");
        }
        if (!"REGISTERED".equals(b.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chỉ hủy được đăng ký đang ở trạng thái Đã đăng ký");
        }
        Tour tour = tours.findById(b.tourId()).orElse(null);
        if (tour != null && !tour.startDate().isAfter(today())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tour đã khởi hành, không thể hủy đăng ký");
        }
        return bookingView(bookings.save(b.cancelled()), tour);
    }

    public List<BookingView> adminList(String tourId, String status) {
        Map<String, Tour> cache = new java.util.HashMap<>();
        return bookings.findAll(NEWEST).stream()
                .filter(b -> tourId == null || tourId.isBlank() || tourId.equals(b.tourId()))
                .filter(b -> status == null || status.isBlank() || status.equals(b.status()))
                .map(b -> bookingView(b, cache.computeIfAbsent(b.tourId(), id -> tours.findById(id).orElse(null))))
                .toList();
    }

    /** Admin xác nhận khách đã đi xong và đã thu tiền mặt. Chỉ làm được khi tour đã kết thúc. */
    public BookingView complete(String bookingId) {
        TourBooking b = findBooking(bookingId);
        if (!"REGISTERED".equals(b.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chỉ xác nhận được đăng ký đang ở trạng thái Đã đăng ký");
        }
        Tour tour = find(b.tourId());
        if (tour.endDate().isAfter(today())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tour chưa kết thúc (ngày kết thúc " + tour.endDate() + "), chưa thể xác nhận thu tiền");
        }
        return bookingView(bookings.save(b.completedAndPaid(Instant.now())), tour);
    }

    private TourBooking findBooking(String id) {
        return bookings.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy đăng ký tour"));
    }

    private BookingView bookingView(TourBooking b, Tour t) {
        boolean reviewed = "COMPLETED".equals(b.status()) && reviews.existsByTourIdAndUserId(b.tourId(), b.userId());
        return new BookingView(b.id(), b.tourId(), t == null ? "(Tour đã bị xóa)" : t.name(), t == null ? null : t.image(),
                t == null ? null : t.startDate(), t == null ? null : t.endDate(), t == null ? null : t.status(),
                b.userEmail(), b.contactName(), b.phone(), b.participants(), b.totalAmount(), b.note(),
                b.status(), b.paymentStatus(), b.paidAt(), b.createdAt(), reviewed);
    }

    // ---------- Đánh giá ----------

    public List<ReviewView> reviews(String tourId, Optional<AuthUser> me) {
        find(tourId);
        return reviews.findByTourId(tourId, NEWEST).stream()
                .map(r -> new ReviewView(r.id(), r.authorName(), r.rating(), r.comment(), r.createdAt(), me.map(u -> u.id().equals(r.userId())).orElse(false)))
                .toList();
    }

    /** Chỉ người đã hoàn thành tour mới được đánh giá; đánh giá lại sẽ cập nhật đánh giá cũ. */
    public ReviewView review(AuthUser user, String tourId, ReviewRequest req) {
        find(tourId);
        TourBooking booking = bookings.findFirstByTourIdAndUserIdAndStatusIn(tourId, user.id(), List.of("COMPLETED"))
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Bạn chỉ có thể đánh giá sau khi đã hoàn thành tour"));
        Optional<TourReview> old = reviews.findByTourIdAndUserId(tourId, user.id());
        String comment = req.comment() == null ? "" : req.comment().trim();
        TourReview saved = reviews.save(new TourReview(old.map(TourReview::id).orElse(null), tourId, booking.id(), user.id(),
                booking.contactName(), req.rating(), comment, old.map(TourReview::createdAt).orElse(Instant.now())));
        return new ReviewView(saved.id(), saved.authorName(), saved.rating(), saved.comment(), saved.createdAt(), true);
    }
}
