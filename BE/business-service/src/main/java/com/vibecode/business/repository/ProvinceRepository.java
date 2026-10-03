package com.vibecode.business.repository;

import com.vibecode.business.model.Province;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProvinceRepository extends MongoRepository<Province, String> {

    @Query(value = "{}", fields = "{ 'geometry': 0 }", sort = "{ 'name': 1 }")
    List<Province> findAllLight();

    Optional<Province> findByCode(int code);
}
