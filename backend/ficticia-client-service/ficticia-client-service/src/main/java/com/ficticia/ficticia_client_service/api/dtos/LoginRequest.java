package com.ficticia.ficticia_client_service.api.dtos;

import com.ficticia.ficticia_client_service.application.validators.PasswordPolicy;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Represents the credentials used for authentication requests.
 */
public class LoginRequest {

    @NotBlank
    private String username;

    @NotBlank
    @Pattern(regexp = PasswordPolicy.REGEX, message = PasswordPolicy.MESSAGE)
    private String password;

    /**
     * Creates an empty {@link LoginRequest}.
     */
    public LoginRequest() {
        // Default constructor for serialization frameworks.
    }

    /**
     * Retrieves the username.
     *
     * @return username value
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets the username.
     *
     * @param username username value
     */
    public void setUsername(final String username) {
        this.username = username;
    }

    /**
     * Retrieves the password.
     *
     * @return password value
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password.
     *
     * @param password password value
     */
    public void setPassword(final String password) {
        this.password = password;
    }
}
