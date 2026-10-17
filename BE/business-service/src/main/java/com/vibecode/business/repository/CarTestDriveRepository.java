package com.vibecode.business.repository;

import com.vibecode.business.model.CarTestDrive;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CarTestDriveRepository extends MongoRepository<CarTestDrive, String> {
    List<CarTestDrive> findByUserEmailOrderByIdDesc(String userEmail);

    List<CarTestDrive> findByStatusOrderByIdDesc(String status);
}
