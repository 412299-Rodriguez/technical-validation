package com.ficticia.ficticia_client_service.api.exception;

/**
 * Exception used to indicate business rule violations.
 */
public class BusinessException extends RuntimeException {

    /**
     * Creates a new {@link BusinessException} with a message.
     *
     * @param message error description
     */
    public BusinessException(final String message) {
        super(message);
    }

    /**
     * Creates a new {@link BusinessException} with a message and cause.
     *
     * @param message error description
     * @param cause   underlying cause
     */
    public BusinessException(final String message, final Throwable cause) {
        super(message, cause);
    }
}
