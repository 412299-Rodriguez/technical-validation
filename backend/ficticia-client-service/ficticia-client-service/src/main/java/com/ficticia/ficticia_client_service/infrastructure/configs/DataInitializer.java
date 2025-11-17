package com.ficticia.ficticia_client_service.infrastructure.configs;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ficticia.ficticia_client_service.infrastructure.entities.RoleEntity;
import com.ficticia.ficticia_client_service.infrastructure.entities.UserEntity;
import com.ficticia.ficticia_client_service.infrastructure.repositories.RoleRepository;
import com.ficticia.ficticia_client_service.infrastructure.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Seeds roles and a default admin user to ease manual testing.
 */
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private static final String DEFAULT_ADMIN_USERNAME = "SUPERADMIN";
    private static final String DEFAULT_ADMIN_EMAIL = "maximoagustinr@gmail.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "Prueba123#";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Ensures an admin role and user exist when the application starts.
     *
     * @return command line runner that seeds authentication data
     */
    @Bean
    CommandLineRunner initData() {
        return args -> {
            RoleEntity adminRole = ensureRoleExists("ROLE_ADMIN");
            ensureRoleExists("ROLE_USER");

            userRepository.findByUsername(DEFAULT_ADMIN_USERNAME).orElseGet(() -> {
                UserEntity admin = UserEntity.builder()
                        .username(DEFAULT_ADMIN_USERNAME)
                        .email(DEFAULT_ADMIN_EMAIL)
                        .password(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                        .enabled(true)
                        .build();
                admin.getRoles().add(adminRole);
                return userRepository.save(admin);
            });
        };
    }

    private RoleEntity ensureRoleExists(final String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(RoleEntity.builder()
                        .name(roleName)
                        .build()));
    }
}
