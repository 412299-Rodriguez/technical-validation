package com.ficticia.ficticia_client_service.infrastructure.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ficticia.ficticia_client_service.infrastructure.entities.UserEntity;

/**
 * Repository responsible for loading {@link UserEntity} instances.
 */
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    /**
     * Loads a user by username.
     *
     * @param username username to search
     * @return optional user
     */
    Optional<UserEntity> findByUsername(String username);
}
