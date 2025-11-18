package com.ficticia.ficticia_client_service.application.services.impl;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ficticia.ficticia_client_service.api.dtos.ForgotPasswordRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginResponse;
import com.ficticia.ficticia_client_service.api.dtos.RegisterRequest;
import com.ficticia.ficticia_client_service.api.dtos.RegisterResponse;
import com.ficticia.ficticia_client_service.api.dtos.ResetPasswordRequest;
import com.ficticia.ficticia_client_service.api.exception.BusinessException;
import com.ficticia.ficticia_client_service.application.services.AuthService;
import com.ficticia.ficticia_client_service.infrastructure.configs.JwtTokenProvider;
import com.ficticia.ficticia_client_service.infrastructure.entities.RoleEntity;
import com.ficticia.ficticia_client_service.infrastructure.entities.UserEntity;
import com.ficticia.ficticia_client_service.infrastructure.repositories.RoleRepository;
import com.ficticia.ficticia_client_service.infrastructure.repositories.UserRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Handles authentication requests by validating credentials and issuing JWT tokens.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.base-url:http://localhost:4200}")
    private String frontendBaseUrl;

    @Value("${app.security.reset-token-minutes:60}")
    private long resetTokenMinutes;

    @Value("${spring.mail.host:unknown}")
    private String mailHost;

    @Value("${spring.mail.port:0}")
    private int mailPort;

    @Value("${spring.mail.properties.mail.smtp.auth:false}")
    private boolean mailSmtpAuth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:false}")
    private boolean mailStartTls;

    @PostConstruct
    void logMailConfiguration() {
        log.info("Password reset emails configured for {}:{} (auth={}, startTLS={})", mailHost, mailPort, mailSmtpAuth,
                mailStartTls);
    }

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
        userRepository.findByUsernameIgnoreCase(request.getUsername())
                .ifPresent(user -> {
                    throw new BusinessException("Username already in use");
                });
        userRepository.findByEmailIgnoreCase(request.getEmail())
                .ifPresent(user -> {
                    throw new BusinessException("Email already in use");
                });
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Password and confirmation must match");
        }
        RoleEntity defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new BusinessException("Default role ROLE_USER not configured"));
        UserEntity user = UserEntity.builder()
                .username(request.getUsername().toLowerCase())
                .email(request.getEmail().toLowerCase())
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

    @Override
    @Transactional
    public void requestPasswordReset(final ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BusinessException("Email must be provided");
        }
        userRepository.findByEmailIgnoreCase(request.getEmail())
                .ifPresentOrElse(user -> {
                    user.setPasswordResetToken(UUID.randomUUID().toString());
                    user.setPasswordResetTokenExpiresAt(Instant.now().plus(resetTokenMinutes, ChronoUnit.MINUTES));
                    userRepository.save(user);
                    sendPasswordResetEmail(user);
                }, () -> log.info("Password reset requested for non-existent email {}", request.getEmail()));
    }

    @Override
    @Transactional
    public void resetPassword(final ResetPasswordRequest request) {
        if (request == null) {
            throw new BusinessException("Reset request must be provided");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Password and confirmation must match");
        }
        UserEntity user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new BusinessException("Invalid or expired reset token"));
        Instant expiresAt = user.getPasswordResetTokenExpiresAt();
        if (expiresAt == null || expiresAt.isBefore(Instant.now())) {
            throw new BusinessException("Invalid or expired reset token");
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
        userRepository.save(user);
    }

    private BusinessException invalidCredentials() {
        return new BusinessException("Invalid username or password");
    }

    private void sendPasswordResetEmail(final UserEntity user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Ficticia - Cambio de contraseña solicitado");
            message.setText(buildResetEmailBody(user.getUsername(), user.getPasswordResetToken()));
            mailSender.send(message);
        } catch (MailException exception) {
            log.error("Failed to send password reset email", exception);
            throw new BusinessException("Imposible enviar el correo electrónico. Por favor, inténtalo de nuevo más tarde.");
        }
    }

    private String buildResetEmailBody(final String username, final String token) {
        String link = String.format("%s/auth/reset-password?token=%s", frontendBaseUrl, token);
        return "Hello " + username + ",\n\n"
                + "Hemos recibido la petición para el cambio de clave. Ingresa en el link de abajo para cambiarla:\n"
                + link + "\n\n"
                + "Si no has pedido el cambio de clave, ignora este mail.\n\n"
                + "Saludos,\n"
                + "Ficticia Security Team";
    }
}
