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

    /**
     * Loads a user by username ignoring case sensitivity.
     *
     * @param username username to lookup
     * @return optional user
     */
    Optional<UserEntity> findByUsernameIgnoreCase(String username);

    /**
     * Loads a user by email ignoring case sensitivity.
     *
     * @param email email to lookup
     * @return optional user
     */
    Optional<UserEntity> findByEmailIgnoreCase(String email);
}
