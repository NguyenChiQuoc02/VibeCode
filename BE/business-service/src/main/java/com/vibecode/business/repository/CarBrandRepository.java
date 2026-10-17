package com.vibecode.business.repository;

import com.vibecode.business.model.CarBrand;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CarBrandRepository extends MongoRepository<CarBrand, String> {
}
