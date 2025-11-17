package com.ficticia.ficticia_client_service.application.services;

import com.ficticia.ficticia_client_service.api.dtos.LoginRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginResponse;
import com.ficticia.ficticia_client_service.api.dtos.auth.RegisterRequest;
import com.ficticia.ficticia_client_service.api.dtos.auth.RegisterResponse;

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
}
