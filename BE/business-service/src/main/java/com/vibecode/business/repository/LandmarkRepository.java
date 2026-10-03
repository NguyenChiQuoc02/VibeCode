package com.vibecode.business.repository;

import com.vibecode.business.model.Landmark;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LandmarkRepository extends MongoRepository<Landmark, String> {
}
