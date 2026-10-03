package com.vibecode.business;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class BusinessServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BusinessServiceApplication.class, args);
    }

    @GetMapping("/api/business/ping")
    public String ping() {
        return "business-service ok";
    }
}
