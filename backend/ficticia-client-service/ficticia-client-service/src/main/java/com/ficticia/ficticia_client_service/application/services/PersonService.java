package com.ficticia.ficticia_client_service.application.services;

import java.util.List;

import com.ficticia.ficticia_client_service.api.dtos.PersonRequest;
import com.ficticia.ficticia_client_service.api.dtos.PersonResponse;

/**
 * Defines the contract for managing person-related use cases.
 */
public interface PersonService {

    /**
     * Retrieves the complete list of registered persons.
     *
     * @return list of {@link PersonResponse}
     */
    List<PersonResponse> getAllPersons();

    /**
     * Retrieves a single person by identifier.
     *
     * @param id unique identifier of the person
     * @return the resolved {@link PersonResponse}
     */
    PersonResponse getPersonById(Long id);

    /**
     * Creates a new person resource.
     *
     * @param request payload describing the person to create
     * @return persisted {@link PersonResponse}
     */
    PersonResponse createPerson(PersonRequest request);

    /**
     * Updates an existing person resource.
     *
     * @param id      identifier of the person being updated
     * @param request payload containing the new data
     * @return updated {@link PersonResponse}
     */
    PersonResponse updatePerson(Long id, PersonRequest request);

    /**
     * Deletes a person resource permanently.
     *
     * @param id identifier of the person to delete
     */
    void deletePerson(Long id);
}
