package com.ficticia.ficticia_client_service.api.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Represents a key/value attribute associated with a person.
 */
public class AdditionalAttributeDto {

    private Long id;

    @NotBlank
    @Size(max = 100)
    private String key;

    @Size(max = 255)
    private String value;

    /**
     * Creates an empty {@link AdditionalAttributeDto}.
     */
    public AdditionalAttributeDto() {
        // Default constructor for serialization frameworks.
    }

    /**
     * Retrieves the identifier of the attribute.
     *
     * @return unique attribute identifier
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the identifier of the attribute.
     *
     * @param id unique attribute identifier
     */
    public void setId(final Long id) {
        this.id = id;
    }

    /**
     * Retrieves the attribute key.
     *
     * @return attribute key
     */
    public String getKey() {
        return key;
    }

    /**
     * Sets the attribute key.
     *
     * @param key attribute key
     */
    public void setKey(final String key) {
        this.key = key;
    }

    /**
     * Retrieves the attribute value.
     *
     * @return attribute value
     */
    public String getValue() {
        return value;
    }

    /**
     * Sets the attribute value.
     *
     * @param value attribute value
     */
    public void setValue(final String value) {
        this.value = value;
    }
}
