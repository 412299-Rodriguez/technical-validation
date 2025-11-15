package com.ficticia.ficticia_client_service.api.exception;

/**
 * Exception thrown when a requested resource cannot be located.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Creates a new {@link ResourceNotFoundException} with a message.
     *
     * @param message error description
     */
    public ResourceNotFoundException(final String message) {
        super(message);
    }

    /**
     * Creates a new {@link ResourceNotFoundException} with a message and cause.
     *
     * @param message error description
     * @param cause   underlying cause
     */
    public ResourceNotFoundException(final String message, final Throwable cause) {
        super(message, cause);
    }
}
