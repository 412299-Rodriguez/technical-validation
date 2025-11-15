package com.ficticia.ficticia_client_service.application.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ficticia.ficticia_client_service.api.dtos.LoginRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginResponse;
import com.ficticia.ficticia_client_service.api.exception.BusinessException;
import com.ficticia.ficticia_client_service.application.services.AuthService;
import com.ficticia.ficticia_client_service.infrastructure.configs.JwtTokenProvider;
import com.ficticia.ficticia_client_service.infrastructure.entities.RoleEntity;
import com.ficticia.ficticia_client_service.infrastructure.entities.UserEntity;
import com.ficticia.ficticia_client_service.infrastructure.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Handles authentication requests by validating credentials and issuing JWT tokens.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public LoginResponse login(final LoginRequest request) {
        if (request == null) {
            throw new BusinessException("Credentials must be provided");
        }
        UserEntity user = userRepository.findByUsername(request.getUsername())
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

    private BusinessException invalidCredentials() {
        return new BusinessException("Invalid username or password");
    }
}
