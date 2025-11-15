package com.ficticia.ficticia_client_service.application.validators;

import com.ficticia.ficticia_client_service.api.dtos.PersonRequest;

/**
 * Aggregates business validations required before executing person operations.
 */
public interface PersonValidator {

    /**
     * Validates the provided request before creating a new person.
     *
     * @param request person payload to validate
     */
    void validateForCreate(PersonRequest request);

    /**
     * Validates the provided request before updating an existing person.
     *
     * @param id      identifier of the person that will be updated
     * @param request person payload to validate
     */
    void validateForUpdate(Long id, PersonRequest request);
}
