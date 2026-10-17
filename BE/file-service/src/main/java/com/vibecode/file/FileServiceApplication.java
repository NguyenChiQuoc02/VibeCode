package com.vibecode.file;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class FileServiceApplication {
    public static void main(String[] args) {
        // DNS của hệ điều hành trên một số máy dev (VPN, adapter ảo) hay báo "No such host is known" với tên miền chưa tra gần đây,
        // làm upload Cloudinary lúc được lúc không. Java tự truy vấn DNS công cộng trước, không được thì quay về DNS hệ thống.
        // Chỉ chạy được trên Java 17 trở xuống. Ghi đè bằng -Dsun.net.spi.nameservice.provider.1=default nếu không muốn dùng.
        System.setProperty("sun.net.spi.nameservice.provider.1", System.getProperty("sun.net.spi.nameservice.provider.1", "dns,sun"));
        System.setProperty("sun.net.spi.nameservice.nameservers", System.getProperty("sun.net.spi.nameservice.nameservers", "8.8.8.8,1.1.1.1"));
        // Mặc định Java nhớ lỗi DNS 10 giây, khiến thử lại luôn thất bại. Các thiết lập này phải đặt trước lần phân giải đầu tiên.
        java.security.Security.setProperty("networkaddress.cache.negative.ttl", "0");
        SpringApplication.run(FileServiceApplication.class, args);
    }

    @GetMapping("/api/files/ping")
    public String ping() {
        return "file-service ok";
    }
}
