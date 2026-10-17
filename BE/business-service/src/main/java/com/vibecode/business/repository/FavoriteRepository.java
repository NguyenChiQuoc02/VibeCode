package com.vibecode.business.repository;

import com.vibecode.business.model.Favorite;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    List<Favorite> findByUserId(String userId, Sort sort);

    Optional<Favorite> findByUserIdAndTypeAndTargetId(String userId, String type, String targetId);
}
