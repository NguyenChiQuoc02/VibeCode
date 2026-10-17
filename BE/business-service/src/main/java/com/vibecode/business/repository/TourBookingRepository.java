package com.vibecode.business.repository;

import com.vibecode.business.model.TourBooking;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TourBookingRepository extends MongoRepository<TourBooking, String> {
    List<TourBooking> findByUserId(String userId, Sort sort);

    List<TourBooking> findByTourIdAndStatusIn(String tourId, Collection<String> statuses);

    Optional<TourBooking> findFirstByTourIdAndUserIdAndStatusIn(String tourId, String userId, Collection<String> statuses);

    List<TourBooking> findByStatusIn(Collection<String> statuses);

    boolean existsByTourId(String tourId);
}
