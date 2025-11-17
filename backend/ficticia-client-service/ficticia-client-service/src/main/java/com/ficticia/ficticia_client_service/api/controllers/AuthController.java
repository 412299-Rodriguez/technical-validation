package com.ficticia.ficticia_client_service.api.controllers;

import com.ficticia.ficticia_client_service.api.dtos.ErrorResponse;
import com.ficticia.ficticia_client_service.api.dtos.ForgotPasswordRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginResponse;
import com.ficticia.ficticia_client_service.api.dtos.RegisterRequest;
import com.ficticia.ficticia_client_service.api.dtos.RegisterResponse;
import com.ficticia.ficticia_client_service.api.dtos.ResetPasswordRequest;
import com.ficticia.ficticia_client_service.application.services.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Handles authentication-related HTTP requests while delegating validation to the application service.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Authentication", description = "Endpoints related to authentication and login")
public class AuthController {

    private final AuthService authService;

    /**
     * Creates a new {@link AuthController}.
     *
     * @param authService service responsible for authentication use cases
     */
    public AuthController(final AuthService authService) {
        this.authService = authService;
    }

    /**
     * Authenticates a user based on credentials.
     *
     * @param loginRequest credentials provided by the client
     * @return HTTP 200 response with token details produced by the service
     */
    @Operation(summary = "Authenticate user", description = "Validates credentials and returns an authentication token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Credentials accepted",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid credentials supplied",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized access attempt",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Unexpected server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody final LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Registers a new user account with a default role.
     *
     * @param registerRequest registration payload
     * @return HTTP 201 response containing the created user summary
     */
    @Operation(summary = "Register user", description = "Creates a new user with a default role when validation succeeds")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered",
                    content = @Content(schema = @Schema(implementation = RegisterResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid payload supplied",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Username already exists",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Unexpected server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody final RegisterRequest registerRequest) {
        RegisterResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Sends the password reset instructions to the provided email address.
     *
     * @param request payload containing the employee email
     * @return HTTP 202 response when the request was processed
     */
    @Operation(summary = "Request password reset", description = "Sends a tokenized link to reset the password.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Reset instructions sent"),
            @ApiResponse(responseCode = "400", description = "Invalid email supplied",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/password/forgot")
    public ResponseEntity<Void> requestPasswordReset(@Valid @RequestBody final ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.accepted().build();
    }

    /**
     * Resets the password using a valid token.
     *
     * @param request payload containing token and new password values
     * @return HTTP 204 response when the password has been updated
     */
    @Operation(summary = "Reset password", description = "Confirms the token and updates the account password.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Password updated"),
            @ApiResponse(responseCode = "400", description = "Invalid token or password",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/password/reset")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody final ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }
}
