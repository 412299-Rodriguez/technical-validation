package com.ficticia.ficticia_client_service.infrastructure.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ficticia.ficticia_client_service.infrastructure.entities.PersonEntity;

/**
 * Repository exposing CRUD operations for {@link PersonEntity}.
 */
@Repository
public interface PersonRepository extends JpaRepository<PersonEntity, Long> {

    /**
     * Searches a person by its unique identification.
     *
     * @param identification identification value to search
     * @return optional person
     */
    Optional<PersonEntity> findByIdentification(String identification);

    /**
     * Checks whether a person exists with the provided identification.
     *
     * @param identification identification value to check
     * @return true when a record exists
     */
    boolean existsByIdentification(String identification);

    /**
     * Checks whether a person exists with the provided identification excluding a specific identifier.
     *
     * @param identification identification value to check
     * @param id             identifier that must be ignored
     * @return true when another record uses the same identification
     */
    boolean existsByIdentificationAndIdNot(String identification, Long id);
}
