package com.ficticia.ficticia_client_service.api.dtos;

import java.util.List;

/**
 * Represents the authentication response returned to clients.
 */
public class LoginResponse {

    private String token;
    private String username;
    private List<String> roles;

    /**
     * Creates an empty {@link LoginResponse}.
     */
    public LoginResponse() {
        // Default constructor for serialization frameworks.
    }

    /**
     * Retrieves the issued authentication token.
     *
     * @return token string
     */
    public String getToken() {
        return token;
    }

    /**
     * Sets the issued authentication token.
     *
     * @param token token string
     */
    public void setToken(final String token) {
        this.token = token;
    }

    /**
     * Retrieves the username associated with the token.
     *
     * @return username string
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets the username associated with the token.
     *
     * @param username username string
     */
    public void setUsername(final String username) {
        this.username = username;
    }

    /**
     * Retrieves the roles granted to the authenticated user.
     *
     * @return list of role names
     */
    public List<String> getRoles() {
        return roles;
    }

    /**
     * Sets the roles granted to the authenticated user.
     *
     * @param roles list of role names
     */
    public void setRoles(final List<String> roles) {
        this.roles = roles;
    }
}
