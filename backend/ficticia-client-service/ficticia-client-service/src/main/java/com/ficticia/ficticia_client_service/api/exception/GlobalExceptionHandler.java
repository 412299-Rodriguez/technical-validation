package com.ficticia.ficticia_client_service.api.exception;

import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.ficticia.ficticia_client_service.api.dtos.ErrorResponse;

/**
 * Translates thrown exceptions into structured HTTP responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles resource-not-found scenarios.
     *
     * @param exception the thrown exception
     * @param request   originating request
     * @return response entity with 404 status
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            final ResourceNotFoundException exception,
            final HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.from(
                HttpStatus.NOT_FOUND, exception.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handles business rule violations.
     *
     * @param exception the thrown exception
     * @param request   originating request
     * @return response entity with 400 status
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            final BusinessException exception,
            final HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.from(
                HttpStatus.BAD_REQUEST, exception.getMessage(), request.getRequestURI());
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles validation errors thrown by Spring.
     *
     * @param exception validation exception instance
     * @param request   originating request
     * @return response entity with 400 status
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            final MethodArgumentNotValidException exception,
            final HttpServletRequest request) {
        String message = Optional.ofNullable(exception.getBindingResult().getFieldError())
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .orElse("Validation failed");
        ErrorResponse response = ErrorResponse.from(
                HttpStatus.BAD_REQUEST, message, request.getRequestURI());
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles unreadable payload errors such as malformed JSON.
     *
     * @param exception unreadable message exception
     * @param request   originating request
     * @return response entity with 400 status
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleNotReadableException(
            final HttpMessageNotReadableException exception,
            final HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.from(
                HttpStatus.BAD_REQUEST, "Malformed request payload", request.getRequestURI());
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles generic uncaught exceptions.
     *
     * @param exception any unexpected exception
     * @param request   originating request
     * @return response entity with 500 status
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            final Exception exception,
            final HttpServletRequest request) {
        String message = Optional.ofNullable(exception.getMessage()).orElse("Unexpected server error");
        ErrorResponse response = ErrorResponse.from(
                HttpStatus.INTERNAL_SERVER_ERROR, message, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
