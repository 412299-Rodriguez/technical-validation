package com.ficticia.ficticia_client_service.application.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ficticia.ficticia_client_service.api.dtos.LoginRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginResponse;
import com.ficticia.ficticia_client_service.api.dtos.RegisterRequest;
import com.ficticia.ficticia_client_service.api.dtos.RegisterResponse;
import com.ficticia.ficticia_client_service.api.exception.BusinessException;
import com.ficticia.ficticia_client_service.application.services.AuthService;
import com.ficticia.ficticia_client_service.infrastructure.configs.JwtTokenProvider;
import com.ficticia.ficticia_client_service.infrastructure.entities.RoleEntity;
import com.ficticia.ficticia_client_service.infrastructure.entities.UserEntity;
import com.ficticia.ficticia_client_service.infrastructure.repositories.RoleRepository;
import com.ficticia.ficticia_client_service.infrastructure.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Handles authentication requests by validating credentials and issuing JWT tokens.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public LoginResponse login(final LoginRequest request) {
        if (request == null) {
            throw new BusinessException("Credentials must be provided");
        }
        UserEntity user = userRepository.findByUsernameIgnoreCase(request.getUsername())
                .orElseThrow(this::invalidCredentials);
        if (!Boolean.TRUE.equals(user.getEnabled())
                || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw invalidCredentials();
        }
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(RoleEntity::getName)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        String token = jwtTokenProvider.generateToken(user.getUsername(), authorities);
        LoginResponse response = new LoginResponse();
        response.setUsername(user.getUsername());
        response.setRoles(authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        response.setToken(token);
        return response;
    }

    /**
     * Registers a new user ensuring uniqueness, password confirmation and default role assignment.
     *
     * @param request registration request payload
     * @return persisted user summary
     */
    @Override
    @Transactional
    public RegisterResponse register(final RegisterRequest request) {
        if (request == null) {
            throw new BusinessException("Registration data must be provided");
        }
        userRepository.findByUsernameIgnoreCase(request.getEmail())
                .ifPresent(user -> {
                    throw new BusinessException("Username already in use");
                });
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Password and confirmation must match");
        }
        RoleEntity defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new BusinessException("Default role ROLE_USER not configured"));
        UserEntity user = UserEntity.builder()
                .username(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(Boolean.TRUE)
                .build();
        user.getRoles().add(defaultRole);
        UserEntity saved = userRepository.save(user);
        return RegisterResponse.builder()
                .username(saved.getUsername())
                .roles(saved.getRoles().stream()
                        .map(RoleEntity::getName)
                        .collect(Collectors.toList()))
                .enabled(Boolean.TRUE.equals(saved.getEnabled()))
                .build();
    }

    private BusinessException invalidCredentials() {
        return new BusinessException("Invalid username or password");
    }
}
