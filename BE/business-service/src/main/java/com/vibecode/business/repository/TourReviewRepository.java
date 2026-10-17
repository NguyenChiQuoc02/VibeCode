package com.vibecode.business.repository;

import com.vibecode.business.model.TourReview;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TourReviewRepository extends MongoRepository<TourReview, String> {
    List<TourReview> findByTourId(String tourId, Sort sort);

    Optional<TourReview> findByTourIdAndUserId(String tourId, String userId);

    boolean existsByTourIdAndUserId(String tourId, String userId);
}
