package com.ficticia.ficticia_client_service.api.controllers;

import java.util.Collections;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Provides a lightweight endpoint to check service availability.
 */
@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Service availability endpoints")
public class HealthController {

    /**
     * Reports the health status of the service.
     *
     * @return HTTP 200 response with a static UP indicator
     */
    @Operation(summary = "Health status", description = "Verifies whether the service is available")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Service is up",
                    content = @Content(schema = @Schema(implementation = HealthResponse.class))),
            @ApiResponse(responseCode = "500", description = "Unexpected server error",
                    content = @Content(schema = @Schema(implementation = HealthResponse.class)))
    })
    @GetMapping
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Collections.singletonMap("status", "UP"));
    }

    /**
     * Projection used for documenting health responses in OpenAPI.
     */
    @Schema(name = "HealthResponse", description = "Simple payload describing service health")
    private static class HealthResponse {
        @Schema(description = "Current service status", example = "UP")
        private String status;
    }
}
