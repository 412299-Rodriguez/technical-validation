package com.ficticia.ficticia_client_service.infrastructure.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ficticia.ficticia_client_service.infrastructure.entities.PersonAdditionalAttributeEntity;

/**
 * Repository for {@link PersonAdditionalAttributeEntity} records.
 */
@Repository
public interface PersonAdditionalAttributeRepository
        extends JpaRepository<PersonAdditionalAttributeEntity, Long> {

    /**
     * Retrieves all additional attributes associated with a person.
     *
     * @param personId person identifier
     * @return list of matching attributes
     */
    List<PersonAdditionalAttributeEntity> findByPersonId(Long personId);

    /**
     * Removes all attributes linked to the provided person identifier.
     *
     * @param personId person identifier
     */
    void deleteByPersonId(Long personId);
}
