package com.vibecode.business.repository;

import com.vibecode.business.model.Destination;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DestinationRepository extends MongoRepository<Destination, String> {

    java.util.List<Destination> findByProvinceCode(int provinceCode, org.springframework.data.domain.Sort sort);
}
