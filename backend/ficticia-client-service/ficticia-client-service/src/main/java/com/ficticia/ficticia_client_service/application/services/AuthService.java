package com.ficticia.ficticia_client_service.application.services;

import com.ficticia.ficticia_client_service.api.dtos.ForgotPasswordRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginResponse;
import com.ficticia.ficticia_client_service.api.dtos.RegisterRequest;
import com.ficticia.ficticia_client_service.api.dtos.RegisterResponse;
import com.ficticia.ficticia_client_service.api.dtos.ResetPasswordRequest;

/**
 * Defines authentication-related use cases.
 */
public interface AuthService {

    /**
     * Authenticates a user using the provided credentials.
     *
     * @param request credentials supplied by the caller
     * @return authentication payload containing token and user information
     */
    LoginResponse login(LoginRequest request);

    /**
     * Registers a new user account using the provided data.
     *
     * @param request registration payload
     * @return persisted user details
     */
    RegisterResponse register(RegisterRequest request);

    /**
     * Generates a password reset token and sends a mail to the provided email address.
     *
     * @param request request containing the employee email
     */
    void requestPasswordReset(ForgotPasswordRequest request);

    /**
     * Resets the password using a valid token.
     *
     * @param request request containing token and new password entries
     */
    void resetPassword(ResetPasswordRequest request);
}
