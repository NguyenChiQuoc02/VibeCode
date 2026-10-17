package com.vibecode.business.stats;

import com.fasterxml.jackson.databind.JsonNode;
import com.vibecode.business.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

/**
 * Gọi REST API của Superset bằng tài khoản dịch vụ, đăng nhập theo phiên (cookie) như giao diện web.
 * Không dùng token JWT vì Superset bản này trả danh sách rỗng cho các request mang token.
 * Cookie phiên được giữ lại, hết hạn thì tự đăng nhập lại.
 */
@Component
public class SupersetClient {

    private final RestClient http;
    private final String username;
    private final String password;
    private volatile String session;

    public SupersetClient(
            @Value("${app.superset.url:http://localhost:8088}") String url,
            @Value("${app.superset.username:}") String username,
            @Value("${app.superset.password:}") String password) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(20000);
        this.http = RestClient.builder().baseUrl(url).requestFactory(factory).build();
        this.username = username;
        this.password = password;
    }

    public JsonNode get(String path) {
        try {
            return http.get().uri(path).header("Cookie", session()).retrieve().body(JsonNode.class);
        } catch (RestClientException first) {
            // Phiên có thể đã hết hạn: đăng nhập lại và thử một lần nữa.
            session = null;
            try {
                return http.get().uri(path).header("Cookie", session()).retrieve().body(JsonNode.class);
            } catch (RestClientException e) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Không lấy được dữ liệu từ Superset");
            }
        }
    }

    private synchronized String session() {
        if (session != null) return session;
        if (username.isBlank() || password.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Chưa cấu hình tài khoản Superset cho business-service (app.superset.*)");
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("username", username);
        form.add("password", password);
        try {
            ResponseEntity<Void> res = http.post().uri("/login/").contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form).retrieve().toBodilessEntity();
            List<String> cookies = res.getHeaders().get("Set-Cookie");
            if (cookies != null) {
                for (String c : cookies) {
                    if (c.startsWith("session=")) {
                        session = c.substring(0, c.indexOf(';') < 0 ? c.length() : c.indexOf(';'));
                        return session;
                    }
                }
            }
        } catch (RestClientException ignored) {
            // rơi xuống thông báo lỗi bên dưới
        }
        throw new ApiException(HttpStatus.BAD_GATEWAY, "Không đăng nhập được Superset");
    }
}
