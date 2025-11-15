package com.ficticia.ficticia_client_service.infrastructure.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ficticia.ficticia_client_service.infrastructure.entities.RoleEntity;

/**
 * Repository granting access to {@link RoleEntity} records.
 */
@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {

    /**
     * Finds a role by its unique name.
     *
     * @param name role name to search
     * @return optional role
     */
    Optional<RoleEntity> findByName(String name);
}
