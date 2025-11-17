-- Crear base de datos (por si no existe)
CREATE DATABASE IF NOT EXISTS ficticia_insurance
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ficticia_insurance;

-- Tabla principal de personas
CREATE TABLE IF NOT EXISTS persons (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    identification  VARCHAR(50)  NOT NULL,
    age             INT          NOT NULL,
    gender          ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    active          TINYINT(1)   NOT NULL DEFAULT 1,

    drives          TINYINT(1)   NOT NULL DEFAULT 0,
    wears_glasses   TINYINT(1)   NOT NULL DEFAULT 0,
    diabetic        TINYINT(1)   NOT NULL DEFAULT 0,
    other_disease   VARCHAR(255) NULL,

    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP 
                                 ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_person_identification UNIQUE (identification)
);

-- Atributos adicionales dinámicos por persona
CREATE TABLE IF NOT EXISTS person_additional_attributes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    person_id  BIGINT       NOT NULL,
    attr_key   VARCHAR(100) NOT NULL,
    attr_value VARCHAR(255) NULL,

    CONSTRAINT fk_person_attr_person
        FOREIGN KEY (person_id) REFERENCES persons(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_person_attr UNIQUE (person_id, attr_key)
);

-- --- (Opcional) Tablas para autenticación básica -----------------

CREATE TABLE IF NOT EXISTS roles (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE,
    email    VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled  TINYINT(1)   NOT NULL DEFAULT 1,
    reset_token VARCHAR(120) NULL,
    reset_token_expires_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id)
        REFERENCES roles(id) ON DELETE CASCADE
);

-- Datos de ejemplo para roles (opcional)
INSERT INTO roles (name)
VALUES ('ROLE_ADMIN'), ('ROLE_USER')
ON DUPLICATE KEY UPDATE name = VALUES(name);
