package com.ficticia.ficticia_client_service.application.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import com.ficticia.ficticia_client_service.api.dtos.PersonRequest;
import com.ficticia.ficticia_client_service.api.dtos.PersonResponse;
import com.ficticia.ficticia_client_service.api.exception.BusinessException;
import com.ficticia.ficticia_client_service.api.exception.ResourceNotFoundException;
import com.ficticia.ficticia_client_service.application.mappers.PersonMapper;
import com.ficticia.ficticia_client_service.application.services.impl.PersonServiceImpl;
import com.ficticia.ficticia_client_service.application.validators.PersonValidator;
import com.ficticia.ficticia_client_service.infrastructure.entities.PersonEntity;
import com.ficticia.ficticia_client_service.infrastructure.repositories.PersonRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for {@link PersonServiceImpl}.
 */
@ExtendWith(MockitoExtension.class)
class PersonServiceImplTest {

    @Mock
    private PersonRepository personRepository;

    @Mock
    private PersonValidator personValidator;

    @Mock
    private PersonMapper personMapper;

    @InjectMocks
    private PersonServiceImpl personService;

    private PersonRequest request;
    private PersonEntity entity;

    @BeforeEach
    void setUp() {
        request = buildRequest();
        entity = buildEntity(1L);
    }

    @Test
    void shouldReturnMappedResponsesWhenListingPersons() {
        PersonEntity otherEntity = buildEntity(2L);
        PersonResponse firstResponse = buildResponse(1L);
        PersonResponse secondResponse = buildResponse(2L);
        when(personRepository.findAll()).thenReturn(List.of(entity, otherEntity));
        when(personMapper.toResponse(entity)).thenReturn(firstResponse);
        when(personMapper.toResponse(otherEntity)).thenReturn(secondResponse);

        List<PersonResponse> responses = personService.getAllPersons();

        assertThat(responses).containsExactly(firstResponse, secondResponse);
        verify(personRepository).findAll();
    }

    @Test
    void shouldReturnPersonWhenItExists() {
        PersonResponse response = buildResponse(1L);
        when(personRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(personMapper.toResponse(entity)).thenReturn(response);

        PersonResponse result = personService.getPersonById(1L);

        assertThat(result).isEqualTo(response);
        verify(personRepository).findById(1L);
    }

    @Test
    void shouldThrowWhenPersonNotFound() {
        when(personRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> personService.getPersonById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void shouldCreatePersonWhenDataIsValid() {
        PersonEntity persistedEntity = buildEntity(5L);
        PersonResponse response = buildResponse(5L);
        when(personMapper.toEntity(request)).thenReturn(entity);
        when(personRepository.existsByIdentification(request.getIdentification())).thenReturn(false);
        when(personRepository.save(entity)).thenReturn(persistedEntity);
        when(personMapper.toResponse(persistedEntity)).thenReturn(response);

        PersonResponse result = personService.createPerson(request);

        assertThat(result).isEqualTo(response);
        verify(personValidator).validateForCreate(request);
        verify(personRepository).existsByIdentification(request.getIdentification());
        verify(personRepository).save(entity);
    }

    @Test
    void shouldThrowWhenIdentificationAlreadyUsedOnCreate() {
        when(personRepository.existsByIdentification(request.getIdentification())).thenReturn(true);

        assertThatThrownBy(() -> personService.createPerson(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Identification");
        verify(personMapper, never()).toEntity(any(PersonRequest.class));
        verify(personRepository, never()).save(any(PersonEntity.class));
    }

    @Test
    void shouldUpdatePersonWhenDataValid() {
        PersonResponse response = buildResponse(1L);
        when(personRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(personRepository.existsByIdentificationAndIdNot(request.getIdentification(), 1L)).thenReturn(false);
        when(personRepository.save(entity)).thenReturn(entity);
        when(personMapper.toResponse(entity)).thenReturn(response);

        PersonResponse result = personService.updatePerson(1L, request);

        assertThat(result).isEqualTo(response);
        verify(personValidator).validateForUpdate(1L, request);
        verify(personMapper).updateEntity(entity, request);
        verify(personRepository).existsByIdentificationAndIdNot(request.getIdentification(), 1L);
    }

    @Test
    void shouldThrowWhenIdentificationAlreadyUsedOnUpdate() {
        when(personRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(personRepository.existsByIdentificationAndIdNot(request.getIdentification(), 1L)).thenReturn(true);

        assertThatThrownBy(() -> personService.updatePerson(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Identification");
        verify(personRepository, never()).save(any(PersonEntity.class));
    }

    @Test
    void shouldDeletePersonWhenItExists() {
        when(personRepository.findById(1L)).thenReturn(Optional.of(entity));
        doNothing().when(personRepository).delete(entity);

        personService.deletePerson(1L);

        verify(personRepository).delete(entity);
    }

    @Test
    void shouldThrowWhenDeletingMissingPerson() {
        when(personRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> personService.deletePerson(1L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(personRepository, never()).delete(any(PersonEntity.class));
    }

    private PersonRequest buildRequest() {
        PersonRequest dto = new PersonRequest();
        dto.setFullName("Jane Doe");
        dto.setIdentification("ID-999");
        dto.setAge(32);
        dto.setGender("FEMALE");
        dto.setActive(Boolean.TRUE);
        dto.setDrives(Boolean.TRUE);
        dto.setWearsGlasses(Boolean.FALSE);
        dto.setDiabetic(Boolean.FALSE);
        dto.setOtherDisease(null);
        return dto;
    }

    private PersonEntity buildEntity(final Long id) {
        return PersonEntity.builder()
                .id(id)
                .fullName("Jane Doe")
                .identification("ID-" + id)
                .age(32)
                .gender("FEMALE")
                .active(Boolean.TRUE)
                .drives(Boolean.TRUE)
                .wearsGlasses(Boolean.FALSE)
                .diabetic(Boolean.FALSE)
                .build();
    }

    private PersonResponse buildResponse(final Long id) {
        PersonResponse response = new PersonResponse();
        response.setId(id);
        response.setFullName("Jane Doe");
        response.setIdentification("ID-" + id);
        response.setAge(32);
        response.setGender("FEMALE");
        response.setActive(Boolean.TRUE);
        response.setDrives(Boolean.TRUE);
        response.setWearsGlasses(Boolean.FALSE);
        response.setDiabetic(Boolean.FALSE);
        return response;
    }
}
