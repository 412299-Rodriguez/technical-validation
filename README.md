# Ficticia Insurance – Person Management System

Life insurance customer management system built as a monolithic application using **Spring Boot**, **Angular** and **MySQL**.  
The goal is to register and manage people (potential life insurance customers), applying business validations and securing the API with **JWT-based authentication**.

---

## 1. Project Overview

This project was developed as a technical exercise for a junior developer position.

The system allows:

- Registering people with personal and health-related attributes.
- Managing additional dynamic attributes per person.
- Listing, updating and deactivating people.
- Authenticating users and protecting the API with JWT.
- Running the whole stack (DB + backend + frontend) with Docker.

The focus is on **clean architecture**, **separation of concerns** and **production-style patterns** rather than pure CRUD only.

---

## 2. Main Features

- **Person management**
  - Create, read, update and delete (or deactivate) persons.
  - Fields: full name, identification, age, gender, active flag, drives, wears glasses, diabetic, other disease.
  - Support for additional dynamic attributes (key/value pairs).

- **Business validations**
  - Required fields (name, identification, age, gender, etc.).
  - Age range (e.g. between 18 and 100).
  - Identification uniqueness.
  - Centralized business validation logic.

- **Authentication & Authorization**
  - `POST /api/auth/login` issues a **JWT token**.
  - Passwords stored hashed with **BCrypt**.
  - Stateless security (`sessionCreationPolicy(STATELESS)`).
  - Role-based authorization (e.g. `ROLE_ADMIN`, `ROLE_USER`).

- **API documentation**
  - REST API documented with **Swagger / OpenAPI** via `springdoc-openapi`.
  - Swagger UI available at `/swagger-ui/index.html`.

- **Dockerized environment**
  - `docker-compose` to run:
    - MySQL database
    - Spring Boot backend
    - Angular frontend

---

## 3. Architecture

The application is a **monolith** with a clear **3-layer architecture**:

1. **Presentation Layer (API)**  
   Package: `com.ficticia.insurance.api.*`
   - REST controllers (`PersonController`, `AuthController`, `HealthController`).
   - DTOs for requests and responses (`PersonRequest`, `PersonResponse`, `LoginRequest`, etc.).
   - Centralized error handling using `GlobalExceptionHandler` and `ErrorResponse`.

2. **Application / Business Layer**  
   Package: `com.ficticia.insurance.application.*`
   - Service interfaces and implementations (`PersonService`, `AuthService`).
   - Business validators (`PersonValidator`, `DefaultPersonValidator`).
   - Mappers between DTOs and entities (`PersonMapper`).
   - Contains the application’s **use cases** and business rules.

3. **Infrastructure / Data Layer**  
   Package: `com.ficticia.insurance.infrastructure.*`
   - JPA entities (`PersonEntity`, `PersonAdditionalAttributeEntity`, `UserEntity`, `RoleEntity`).
   - Spring Data repositories (`PersonRepository`, `UserRepository`, etc.).
   - Security configuration (`SecurityConfig`, `JwtAuthenticationFilter`, `JwtTokenProvider`).
   - Database configuration and integration with MySQL.

**Design patterns used:**

- Layered Architecture (3-tier)
- Repository pattern (Spring Data JPA)
- DTO pattern for API contracts
- Service layer pattern for use cases
- Strategy-like pattern for validations (validator interface + implementation)
- Filter / Chain of Responsibility via `JwtAuthenticationFilter`
- Builder pattern (via Lombok `@Builder` where applicable)
- Dependency Injection / Inversion of Control (Spring container)

---

## 4. Tech Stack

**Backend**

- Java 17
- Spring Boot 3.x
  - Spring Web
  - Spring Data JPA
  - Spring Security 6 (JWT)
  - Bean Validation (Jakarta Validation)
- MySQL
- Maven
- Springdoc OpenAPI (Swagger)
- Lombok

**Frontend**

- Angular (CLI-generated app)
- TypeScript
- Angular Router
- HTTP client for REST communication

**Infrastructure**

- Docker
- Docker Compose

---

## 5. Project Structure

**Mono-repo layout:**
```
ficticia-insurance/
 ├─ backend/                # Java-Spring Boot project
 │   └─ src/main/java/com/ficticia/insurance/...
 │
 └─ frontend/
     └─ ficticia-person-client/   # Angular application
```