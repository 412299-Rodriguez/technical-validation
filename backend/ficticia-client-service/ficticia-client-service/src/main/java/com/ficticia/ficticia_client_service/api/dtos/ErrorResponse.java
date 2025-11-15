package com.ficticia.ficticia_client_service.api.dtos;

import java.time.Instant;

import org.springframework.http.HttpStatus;

/**
 * Represents the standardized error payload returned by the API.
 */
public class ErrorResponse {

    private Instant timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

    /**
     * Creates an empty {@link ErrorResponse}.
     */
    public ErrorResponse() {
        // Default constructor for serialization frameworks.
    }

    /**
     * Builds a new {@link ErrorResponse} instance from the provided context.
     *
     * @param status  HTTP status associated with the error
     * @param message descriptive error message
     * @param path    request path that triggered the error
     * @return populated {@link ErrorResponse}
     */
    public static ErrorResponse from(final HttpStatus status, final String message, final String path) {
        ErrorResponse response = new ErrorResponse();
        response.setTimestamp(Instant.now());
        response.setStatus(status.value());
        response.setError(status.getReasonPhrase());
        response.setMessage(message);
        response.setPath(path);
        return response;
    }

    /**
     * Retrieves the timestamp of the error.
     *
     * @return timestamp value
     */
    public Instant getTimestamp() {
        return timestamp;
    }

    /**
     * Sets the timestamp of the error.
     *
     * @param timestamp timestamp value
     */
    public void setTimestamp(final Instant timestamp) {
        this.timestamp = timestamp;
    }

    /**
     * Retrieves the HTTP status code.
     *
     * @return HTTP status code
     */
    public int getStatus() {
        return status;
    }

    /**
     * Sets the HTTP status code.
     *
     * @param status HTTP status code
     */
    public void setStatus(final int status) {
        this.status = status;
    }

    /**
     * Retrieves the HTTP error description.
     *
     * @return HTTP error description
     */
    public String getError() {
        return error;
    }

    /**
     * Sets the HTTP error description.
     *
     * @param error HTTP error description
     */
    public void setError(final String error) {
        this.error = error;
    }

    /**
     * Retrieves the detailed message.
     *
     * @return detailed message
     */
    public String getMessage() {
        return message;
    }

    /**
     * Sets the detailed message.
     *
     * @param message detailed message
     */
    public void setMessage(final String message) {
        this.message = message;
    }

    /**
     * Retrieves the request path that triggered the error.
     *
     * @return request path
     */
    public String getPath() {
        return path;
    }

    /**
     * Sets the request path that triggered the error.
     *
     * @param path request path
     */
    public void setPath(final String path) {
        this.path = path;
    }
}
