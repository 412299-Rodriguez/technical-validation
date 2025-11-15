package com.ficticia.ficticia_client_service.application.services.impl;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ficticia.ficticia_client_service.api.dtos.PersonRequest;
import com.ficticia.ficticia_client_service.api.dtos.PersonResponse;
import com.ficticia.ficticia_client_service.api.exception.BusinessException;
import com.ficticia.ficticia_client_service.api.exception.ResourceNotFoundException;
import com.ficticia.ficticia_client_service.application.mappers.PersonMapper;
import com.ficticia.ficticia_client_service.application.services.PersonService;
import com.ficticia.ficticia_client_service.application.validators.PersonValidator;
import com.ficticia.ficticia_client_service.infrastructure.entities.PersonEntity;
import com.ficticia.ficticia_client_service.infrastructure.repositories.PersonRepository;

/**
 * Default implementation of {@link PersonService} orchestrating persistence, mapping and validation.
 */
@Service
@Transactional(readOnly = true)
public class PersonServiceImpl implements PersonService {

    private final PersonRepository personRepository;
    private final PersonValidator personValidator;
    private final PersonMapper personMapper;

    /**
     * Creates a new {@link PersonServiceImpl}.
     *
     * @param personRepository repository used to persist persons
     * @param personValidator  validator containing business rules
     * @param personMapper     mapper converting between DTOs and entities
     */
    public PersonServiceImpl(final PersonRepository personRepository,
                              final PersonValidator personValidator,
                              final PersonMapper personMapper) {
        this.personRepository = personRepository;
        this.personValidator = personValidator;
        this.personMapper = personMapper;
    }

    @Override
    public List<PersonResponse> getAllPersons() {
        return personRepository.findAll().stream()
                .map(personMapper::toResponse)
                .toList();
    }

    @Override
    public PersonResponse getPersonById(final Long id) {
        PersonEntity entity = findEntityById(id);
        return personMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public PersonResponse createPerson(final PersonRequest request) {
        personValidator.validateForCreate(request);
        ensureIdentificationUnique(request.getIdentification(), null);
        PersonEntity entity = personMapper.toEntity(request);
        PersonEntity savedPerson = personRepository.save(entity);
        return personMapper.toResponse(savedPerson);
    }

    @Override
    @Transactional
    public PersonResponse updatePerson(final Long id, final PersonRequest request) {
        PersonEntity entity = findEntityById(id);
        personValidator.validateForUpdate(id, request);
        ensureIdentificationUnique(request.getIdentification(), id);
        personMapper.updateEntity(entity, request);
        PersonEntity savedPerson = personRepository.save(entity);
        return personMapper.toResponse(savedPerson);
    }

    @Override
    @Transactional
    public void deletePerson(final Long id) {
        PersonEntity entity = findEntityById(id);
        personRepository.delete(entity);
    }

    private PersonEntity findEntityById(final Long id) {
        return personRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(Locale.ROOT, "Person with id %d was not found", id)));
    }

    private void ensureIdentificationUnique(final String identification, final Long currentId) {
        boolean exists = currentId == null
                ? personRepository.existsByIdentification(identification)
                : personRepository.existsByIdentificationAndIdNot(identification, currentId);
        if (exists) {
            throw new BusinessException("Identification must be unique");
        }
    }
}
