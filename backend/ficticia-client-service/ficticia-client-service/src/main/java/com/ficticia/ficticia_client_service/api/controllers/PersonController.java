package com.ficticia.ficticia_client_service.api.controllers;

import java.net.URI;
import java.util.List;

import com.ficticia.ficticia_client_service.api.dtos.ErrorResponse;
import com.ficticia.ficticia_client_service.api.dtos.PersonRequest;
import com.ficticia.ficticia_client_service.api.dtos.PersonResponse;
import com.ficticia.ficticia_client_service.application.services.PersonService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Exposes REST endpoints to manage person resources while delegating business logic to the application layer.
 */
@RestController
@RequestMapping("/api/persons")
@Validated
@Tag(name = "Persons", description = "Operations related to person resources")
public class PersonController {

    private final PersonService personService;

    /**
     * Creates a new {@link PersonController} with the required dependencies.
     *
     * @param personService service orchestrating person use cases
     */
    public PersonController(final PersonService personService) {
        this.personService = personService;
    }

    /**
     * Retrieves all person records.
     *
     * @return HTTP 200 response with the collection returned by the service
     */
    @Operation(summary = "List persons", description = "Retrieves the complete collection of persons")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Persons retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = PersonResponse.class)))),
            @ApiResponse(responseCode = "500", description = "Unexpected server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<PersonResponse>> getPersons() {
        List<PersonResponse> persons = personService.getAllPersons();
        return ResponseEntity.ok(persons);
    }

    /**
     * Retrieves a single person by identifier.
     *
     * @param id unique identifier of the person
     * @return HTTP 200 response containing the resolved person
     */
    @Operation(summary = "Get person", description = "Retrieves a single person by identifier")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Person retrieved successfully",
                    content = @Content(schema = @Schema(implementation = PersonResponse.class))),
            @ApiResponse(responseCode = "404", description = "Person not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Unexpected server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<PersonResponse> getPerson(
            @Parameter(in = ParameterIn.PATH, description = "Unique identifier of the person", required = true)
            @PathVariable("id") final Long id) {
        PersonResponse person = personService.getPersonById(id);
        return ResponseEntity.ok(person);
    }

    /**
     * Creates a new person based on the provided payload.
     *
     * @param personRequest request payload describing the person to create
     * @return HTTP 201 response with the persisted person representation
     */
    @Operation(summary = "Create person", description = "Creates a new person using the provided payload")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Person created successfully",
                    content = @Content(schema = @Schema(implementation = PersonResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Business rule violation",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Unexpected server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    public ResponseEntity<PersonResponse> createPerson(@Valid @RequestBody final PersonRequest personRequest) {
        PersonResponse createdPerson = personService.createPerson(personRequest);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdPerson.getId())
                .toUri();
        return ResponseEntity.created(location).body(createdPerson);
    }

    /**
     * Updates an existing person.
     *
     * @param id            identifier of the person that should be updated
     * @param personRequest request payload containing the new person information
     * @return HTTP 200 response with the updated person
     */
    @Operation(summary = "Update person", description = "Updates the attributes of an existing person")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Person updated successfully",
                    content = @Content(schema = @Schema(implementation = PersonResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Person not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Business rule violation",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Unexpected server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<PersonResponse> updatePerson(
            @Parameter(in = ParameterIn.PATH, description = "Unique identifier of the person", required = true)
            @PathVariable("id") final Long id,
            @Valid @RequestBody final PersonRequest personRequest) {
        PersonResponse updatedPerson = personService.updatePerson(id, personRequest);
        return ResponseEntity.ok(updatedPerson);
    }

    /**
     * Deletes a person by identifier.
     *
     * @param id unique identifier of the person to delete
     * @return HTTP 204 response to confirm the deletion
     */
    @Operation(summary = "Delete person", description = "Deletes a person by identifier")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Person deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Person not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Unexpected server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(
            @Parameter(in = ParameterIn.PATH, description = "Unique identifier of the person", required = true)
            @PathVariable("id") final Long id) {
        personService.deletePerson(id);
        return ResponseEntity.noContent().build();
    }
}
