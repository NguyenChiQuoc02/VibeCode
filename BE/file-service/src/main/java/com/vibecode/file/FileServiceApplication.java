package com.vibecode.file;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class FileServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(FileServiceApplication.class, args);
    }

    @GetMapping("/api/files/ping")
    public String ping() {
        return "file-service ok";
    }
}
