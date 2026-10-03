package com.vibecode.business.repository;

import com.vibecode.business.model.Ward;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WardRepository extends MongoRepository<Ward, String> {

    @Query(value = "{ 'province_code': ?0 }", fields = "{ 'geometry': 0 }", sort = "{ 'name': 1 }")
    List<Ward> findLightByProvinceCode(int provinceCode);

    List<Ward> findByProvinceCode(int provinceCode);

    Optional<Ward> findByCode(int code);
}
