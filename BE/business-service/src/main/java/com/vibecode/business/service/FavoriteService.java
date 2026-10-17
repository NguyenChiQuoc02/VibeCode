package com.vibecode.business.service;

import com.vibecode.business.dto.FavoriteDtos.FavoriteView;
import com.vibecode.business.exception.ApiException;
import com.vibecode.business.model.Favorite;
import com.vibecode.business.repository.FavoriteRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FavoriteService {

    private static final Map<String, String> COLLECTIONS = Map.of("TOUR", "tours", "DESTINATION", "destinations", "LANDMARK", "landmarks");

    private final FavoriteRepository favorites;
    private final MongoTemplate mongo;

    public FavoriteService(FavoriteRepository favorites, MongoTemplate mongo) {
        this.favorites = favorites;
        this.mongo = mongo;
    }

    private static Object key(String id) {
        return ObjectId.isValid(id) ? new ObjectId(id) : id;
    }

    private String collection(String type) {
        String c = COLLECTIONS.get(type);
        if (c == null) throw new ApiException(HttpStatus.BAD_REQUEST, "Loại yêu thích không hợp lệ");
        return c;
    }

    /** Danh sách khóa "TYPE:id" để FE tô màu nút tim; nhẹ nên gọi ở mọi trang. */
    public List<String> keys(AuthUser user) {
        return favorites.findByUserId(user.id(), Sort.by(Sort.Direction.DESC, "id")).stream().map(f -> f.type() + ":" + f.targetId()).toList();
    }

    /** Thêm yêu thích (gọi lại nhiều lần vẫn chỉ có một bản ghi). */
    public void add(AuthUser user, String type, String targetId) {
        String coll = collection(type);
        if (favorites.findByUserIdAndTypeAndTargetId(user.id(), type, targetId).isPresent()) return;
        if (!mongo.exists(new Query(Criteria.where("_id").is(key(targetId))), coll)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy mục cần yêu thích");
        }
        favorites.save(new Favorite(null, user.id(), type, targetId, Instant.now()));
    }

    public void remove(AuthUser user, String type, String targetId) {
        collection(type);
        favorites.findByUserIdAndTypeAndTargetId(user.id(), type, targetId).ifPresent(favorites::delete);
    }

    /** Danh sách yêu thích mới nhất trước, kèm tên, ảnh. Mục đã bị xóa khỏi hệ thống thì bỏ qua. */
    public List<FavoriteView> list(AuthUser user) {
        List<Favorite> all = favorites.findByUserId(user.id(), Sort.by(Sort.Direction.DESC, "id"));
        Map<String, Map<String, Document>> docs = new HashMap<>();
        for (String type : COLLECTIONS.keySet()) {
            List<Object> ids = all.stream().filter(f -> f.type().equals(type)).map(f -> key(f.targetId())).toList();
            Map<String, Document> byId = new HashMap<>();
            if (!ids.isEmpty()) {
                Query q = new Query(Criteria.where("_id").in(ids));
                q.fields().include("name", "address", "url_image", "image", "price", "durationDays");
                for (Document d : mongo.find(q, Document.class, COLLECTIONS.get(type))) byId.put(String.valueOf(d.get("_id")), d);
            }
            docs.put(type, byId);
        }
        return all.stream().map(f -> {
            Document d = docs.get(f.type()).get(f.targetId());
            if (d == null) return null;
            boolean tour = "TOUR".equals(f.type());
            String image = tour ? d.getString("image") : d.getString("url_image");
            String subtitle = tour ? d.get("durationDays") + " ngày" : d.getString("address");
            Long price = tour && d.get("price") instanceof Number n ? n.longValue() : null;
            return new FavoriteView(f.type(), f.targetId(), d.getString("name"), image, subtitle, price, f.createdAt());
        }).filter(v -> v != null).toList();
    }
}
