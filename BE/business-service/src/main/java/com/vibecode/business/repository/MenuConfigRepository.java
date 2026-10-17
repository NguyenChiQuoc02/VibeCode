package com.vibecode.business.repository;

import com.vibecode.business.model.MenuConfig;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MenuConfigRepository extends MongoRepository<MenuConfig, String> {
}
