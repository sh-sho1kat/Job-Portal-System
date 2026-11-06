package com.sho1kat.config;

import com.sho1kat.entity.User;
import com.sho1kat.enums.UserRole;
import com.sho1kat.enums.UserStatus;
import com.sho1kat.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SuperAdminInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String email;
    private final String password;
    private final String firstName;
    private final String lastName;

    public SuperAdminInitializer(UserRepository userRepository,
                            PasswordEncoder passwordEncoder,
                            @Value("${app.super-admin.enabled:false}") boolean enabled,
                            @Value("${app.super-admin.email:}") String email,
                            @Value("${app.super-admin.password:}") String password,
                            @Value("${app.super-admin.first-name:Super}") String firstName,
                            @Value("${app.super-admin.last-name:Admin}") String lastName) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    @Override
    public void run(@NonNull ApplicationArguments args) {
        if (!enabled || email == null || email.isBlank()) {
            log.debug("Super-admin bootstrap disabled (app.super-admin.enabled/email); skipping");
            return;
        }
        if (password == null || password.isBlank()) {
            log.warn("app.super-admin.email is set but password is missing; skipping bootstrap");
            return;
        }

        userRepository.findByEmailIgnoreCase(email.trim()).ifPresentOrElse(user -> {
            if (user.getUserRole() != UserRole.ROLE_SUPER_ADMIN) {
                user.setUserRole(UserRole.ROLE_SUPER_ADMIN);
                userRepository.save(user);
                log.info("Promoted existing user {} to SUPER_ADMIN", email);
            } else {
                log.info("SUPER_ADMIN {} already present", email);
            }
        }, () -> {
            userRepository.save(User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email.trim())
                    .passwordHash(passwordEncoder.encode(password))
                    .status(UserStatus.ACTIVE)
                    .userRole(UserRole.ROLE_SUPER_ADMIN)
                    .build());
            log.info("Bootstrapped SUPER_ADMIN account {}", email);
        });
    }
}
