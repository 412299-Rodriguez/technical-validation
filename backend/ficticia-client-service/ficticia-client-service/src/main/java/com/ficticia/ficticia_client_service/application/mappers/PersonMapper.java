package com.ficticia.ficticia_client_service.application.mappers;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.ficticia.ficticia_client_service.api.dtos.AdditionalAttributeDto;
import com.ficticia.ficticia_client_service.api.dtos.PersonRequest;
import com.ficticia.ficticia_client_service.api.dtos.PersonResponse;
import com.ficticia.ficticia_client_service.infrastructure.entities.PersonAdditionalAttributeEntity;
import com.ficticia.ficticia_client_service.infrastructure.entities.PersonEntity;

import org.springframework.stereotype.Component;

/**
 * Converts between API DTOs and persistence entities for person-related structures.
 */
@Component
public class PersonMapper {

    /**
     * Converts a {@link PersonRequest} into a fully initialized {@link PersonEntity}.
     *
     * @param request source payload
     * @return populated entity instance
     */
    public PersonEntity toEntity(final PersonRequest request) {
        if (request == null) {
            return null;
        }
        PersonEntity entity = new PersonEntity();
        applyRequest(entity, request);
        List<PersonAdditionalAttributeEntity> attributes = toAdditionalAttributeEntities(
                request.getAdditionalAttributes(), entity);
        entity.setAdditionalAttributes(attributes);
        return entity;
    }

    /**
     * Updates an existing {@link PersonEntity} with values from the request.
     *
     * @param entity  target entity to mutate
     * @param request request carrying the source values
     */
    public void updateEntity(final PersonEntity entity, final PersonRequest request) {
        if (entity == null || request == null) {
            return;
        }
        applyRequest(entity, request);
        List<PersonAdditionalAttributeEntity> attributes = toAdditionalAttributeEntities(
                request.getAdditionalAttributes(), entity);
        List<PersonAdditionalAttributeEntity> currentAttributes = entity.getAdditionalAttributes();
        if (currentAttributes == null) {
            entity.setAdditionalAttributes(attributes);
        } else {
            currentAttributes.clear();
            currentAttributes.addAll(attributes);
        }
    }

    /**
     * Converts a {@link PersonEntity} into a {@link PersonResponse} to return via the API.
     *
     * @param entity source entity
     * @return mapped response
     */
    public PersonResponse toResponse(final PersonEntity entity) {
        if (entity == null) {
            return null;
        }
        PersonResponse response = new PersonResponse();
        response.setId(entity.getId());
        response.setFullName(entity.getFullName());
        response.setIdentification(entity.getIdentification());
        response.setAge(entity.getAge());
        response.setGender(entity.getGender());
        response.setActive(entity.getActive());
        response.setDrives(entity.getDrives());
        response.setWearsGlasses(entity.getWearsGlasses());
        response.setDiabetic(entity.getDiabetic());
        response.setOtherDisease(entity.getOtherDisease());
        response.setAdditionalAttributes(toAdditionalAttributeDtos(entity.getAdditionalAttributes()));
        return response;
    }

    /**
     * Converts API DTOs into attribute entities linked to the provided person.
     *
     * @param additionalAttributes DTO list to convert
     * @param owner                parent person entity used for relationships
     * @return converted list or empty list when not present
     */
    public List<PersonAdditionalAttributeEntity> toAdditionalAttributeEntities(
            final List<AdditionalAttributeDto> additionalAttributes,
            final PersonEntity owner) {
        if (additionalAttributes == null || additionalAttributes.isEmpty()) {
            return new ArrayList<>();
        }
        return additionalAttributes.stream()
                .filter(Objects::nonNull)
                .map(dto -> createAdditionalAttributeEntity(dto, owner))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    /**
     * Converts entity attributes into DTOs.
     *
     * @param entities attribute entities loaded from persistence
     * @return DTO list safe to expose to the API
     */
    public List<AdditionalAttributeDto> toAdditionalAttributeDtos(
            final List<PersonAdditionalAttributeEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(this::createAdditionalAttributeDto)
                .collect(Collectors.toList());
    }

    private void applyRequest(final PersonEntity entity, final PersonRequest request) {
        entity.setFullName(request.getFullName());
        entity.setIdentification(request.getIdentification());
        entity.setAge(request.getAge());
        entity.setGender(request.getGender());
        entity.setActive(request.getActive());
        entity.setDrives(request.getDrives());
        entity.setWearsGlasses(request.getWearsGlasses());
        entity.setDiabetic(request.getDiabetic());
        entity.setOtherDisease(request.getOtherDisease());
    }

    private PersonAdditionalAttributeEntity createAdditionalAttributeEntity(
            final AdditionalAttributeDto dto,
            final PersonEntity owner) {
        PersonAdditionalAttributeEntity entity = new PersonAdditionalAttributeEntity();
        // IDs are always generated; forcing them to null avoids detached entity errors
        entity.setId(null);
        entity.setAttrKey(dto.getKey());
        entity.setAttrValue(dto.getValue());
        entity.setPerson(owner);
        return entity;
    }

    private AdditionalAttributeDto createAdditionalAttributeDto(
            final PersonAdditionalAttributeEntity entity) {
        AdditionalAttributeDto dto = new AdditionalAttributeDto();
        dto.setId(entity.getId());
        dto.setKey(entity.getAttrKey());
        dto.setValue(entity.getAttrValue());
        return dto;
    }
}
