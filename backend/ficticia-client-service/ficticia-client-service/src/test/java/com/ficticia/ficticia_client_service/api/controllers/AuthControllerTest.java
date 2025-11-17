package com.ficticia.ficticia_client_service.api.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ficticia.ficticia_client_service.api.dtos.ForgotPasswordRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginResponse;
import com.ficticia.ficticia_client_service.api.dtos.RegisterRequest;
import com.ficticia.ficticia_client_service.api.dtos.RegisterResponse;
import com.ficticia.ficticia_client_service.api.dtos.ResetPasswordRequest;
import com.ficticia.ficticia_client_service.application.services.AuthService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Unit tests for {@link AuthController}.
 */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private static final String STRONG_PASSWORD = "Strong12!";

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void shouldReturnTokenWhenLoginSucceeds() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword(STRONG_PASSWORD);
        LoginResponse responseBody = new LoginResponse();
        responseBody.setUsername("user");
        responseBody.setToken("jwt-token");
        when(authService.login(request)).thenReturn(responseBody);

        ResponseEntity<LoginResponse> response = authController.login(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(responseBody);
        verify(authService).login(request);
    }

    @Test
    void shouldReturnCreatedResponseWhenRegisteringUser() {
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser")
                .password(STRONG_PASSWORD)
                .confirmPassword(STRONG_PASSWORD)
                .email("user@mail.com")
                .employeeId("EMP-1")
                .fullName("New User")
                .build();
        RegisterResponse responseBody = RegisterResponse.builder()
                .username("newuser")
                .enabled(true)
                .build();
        when(authService.register(request)).thenReturn(responseBody);

        ResponseEntity<RegisterResponse> response = authController.register(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(responseBody);
        verify(authService).register(request);
    }

    @Test
    void shouldAcceptForgotPasswordRequest() {
        ForgotPasswordRequest request = ForgotPasswordRequest.builder()
                .email("user@mail.com")
                .build();

        ResponseEntity<Void> response = authController.requestPasswordReset(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.ACCEPTED);
        verify(authService).requestPasswordReset(request);
    }

    @Test
    void shouldResetPassword() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .token("token")
                .password(STRONG_PASSWORD)
                .confirmPassword(STRONG_PASSWORD)
                .build();

        ResponseEntity<Void> response = authController.resetPassword(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(authService).resetPassword(request);
    }
}
