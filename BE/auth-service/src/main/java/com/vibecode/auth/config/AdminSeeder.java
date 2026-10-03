package com.vibecode.auth.config;

import com.vibecode.auth.model.Role;
import com.vibecode.auth.model.User;
import com.vibecode.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final String email, password, fullName;

    public AdminSeeder(UserRepository users, PasswordEncoder encoder,
                       @Value("${app.admin.email}") String email,
                       @Value("${app.admin.password}") String password,
                       @Value("${app.admin.full-name}") String fullName) {
        this.users = users;
        this.encoder = encoder;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
    }

    @Override
    public void run(String... args) {
        if (users.existsByEmail(email)) return;
        User admin = new User();
        admin.setFullName(fullName);
        admin.setEmail(email);
        admin.setPassword(encoder.encode(password));
        admin.setRole(Role.ADMIN);
        users.save(admin);
    }
}
