package com.ficticia.ficticia_client_service.api.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import com.ficticia.ficticia_client_service.api.dtos.PersonRequest;
import com.ficticia.ficticia_client_service.api.dtos.PersonResponse;
import com.ficticia.ficticia_client_service.application.services.PersonService;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Unit tests for {@link PersonController}.
 */
@ExtendWith(MockitoExtension.class)
class PersonControllerTest {

    @Mock
    private PersonService personService;

    @InjectMocks
    private PersonController personController;

    @AfterEach
    void resetRequestContext() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void shouldReturnAllPersonsWhenGetPersonsInvoked() {
        List<PersonResponse> serviceResponse = List.of(personResponse(1L), personResponse(2L));
        when(personService.getAllPersons()).thenReturn(serviceResponse);

        ResponseEntity<List<PersonResponse>> response = personController.getPersons();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactlyElementsOf(serviceResponse);
        verify(personService).getAllPersons();
    }

    @Test
    void shouldReturnPersonWhenGetPersonByIdInvoked() {
        PersonResponse expected = personResponse(5L);
        when(personService.getPersonById(5L)).thenReturn(expected);

        ResponseEntity<PersonResponse> response = personController.getPerson(5L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
        verify(personService).getPersonById(5L);
    }

    @Test
    void shouldReturnCreatedResponseWhenPersonCreated() {
        PersonRequest request = personRequest();
        PersonResponse created = personResponse(10L);
        when(personService.createPerson(request)).thenReturn(created);
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.setScheme("http");
        servletRequest.setServerName("localhost");
        servletRequest.setServerPort(8080);
        servletRequest.setRequestURI("/api/persons");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(servletRequest));

        ResponseEntity<PersonResponse> response = personController.createPerson(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getHeaders().getLocation()).hasToString("http://localhost:8080/api/persons/10");
        assertThat(response.getBody()).isEqualTo(created);
        verify(personService).createPerson(request);
    }

    @Test
    void shouldReturnUpdatedPersonWhenUpdateInvoked() {
        PersonRequest request = personRequest();
        PersonResponse updated = personResponse(20L);
        when(personService.updatePerson(20L, request)).thenReturn(updated);

        ResponseEntity<PersonResponse> response = personController.updatePerson(20L, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(updated);
        verify(personService).updatePerson(20L, request);
    }

    @Test
    void shouldReturnNoContentWhenDeleteInvoked() {
        doNothing().when(personService).deletePerson(30L);

        ResponseEntity<Void> response = personController.deletePerson(30L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(response.getBody()).isNull();
        verify(personService).deletePerson(30L);
    }

    private PersonRequest personRequest() {
        PersonRequest request = new PersonRequest();
        request.setFullName("John Doe");
        request.setIdentification("ID-123");
        request.setAge(30);
        request.setGender("MALE");
        request.setActive(Boolean.TRUE);
        request.setDrives(Boolean.TRUE);
        request.setWearsGlasses(Boolean.FALSE);
        request.setDiabetic(Boolean.FALSE);
        request.setOtherDisease(null);
        return request;
    }

    private PersonResponse personResponse(final Long id) {
        PersonResponse response = new PersonResponse();
        response.setId(id);
        response.setFullName("John Doe");
        response.setIdentification("ID-" + id);
        response.setAge(30);
        response.setGender("MALE");
        response.setActive(Boolean.TRUE);
        response.setDrives(Boolean.TRUE);
        response.setWearsGlasses(Boolean.FALSE);
        response.setDiabetic(Boolean.FALSE);
        response.setOtherDisease(null);
        return response;
    }
}
