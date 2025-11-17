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

            userRepository.findByUsername("admin").orElseGet(() -> {
                UserEntity admin = UserEntity.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
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
