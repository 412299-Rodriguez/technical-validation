package com.ficticia.ficticia_client_service.application.services;

import com.ficticia.ficticia_client_service.api.dtos.LoginRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginResponse;

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
}
