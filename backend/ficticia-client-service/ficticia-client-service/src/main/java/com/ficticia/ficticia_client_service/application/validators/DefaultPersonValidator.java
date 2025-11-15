package com.ficticia.ficticia_client_service.application.validators;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.ficticia.ficticia_client_service.api.dtos.AdditionalAttributeDto;
import com.ficticia.ficticia_client_service.api.dtos.PersonRequest;
import com.ficticia.ficticia_client_service.api.exception.BusinessException;

/**
 * Default implementation of {@link PersonValidator} providing reusable business rules.
 */
@Component
public class DefaultPersonValidator implements PersonValidator {

    private static final int MIN_AGE = 18;
    private static final int MAX_AGE = 100;

    @Override
    public void validateForCreate(final PersonRequest request) {
        validateRequestPayload(request);
    }

    @Override
    public void validateForUpdate(final Long id, final PersonRequest request) {
        if (id == null) {
            throw new BusinessException("Person identifier must be provided for updates");
        }
        validateRequestPayload(request);
    }

    private void validateRequestPayload(final PersonRequest request) {
        if (request == null) {
            throw new BusinessException("Person data must be provided");
        }
        validateAge(request.getAge());
        validateDiseaseInformation(request);
        validateAdditionalAttributes(request.getAdditionalAttributes());
    }

    private void validateAge(final Integer age) {
        if (age == null || age < MIN_AGE || age > MAX_AGE) {
            throw new BusinessException(String.format(
                    Locale.ROOT,
                    "Age must be between %d and %d years", MIN_AGE, MAX_AGE));
        }
    }

    private void validateDiseaseInformation(final PersonRequest request) {
        if (Boolean.TRUE.equals(request.getDiabetic()) && request.getOtherDisease() != null) {
            request.setOtherDisease(request.getOtherDisease().trim());
        }
        if (Boolean.FALSE.equals(request.getDiabetic()) && request.getOtherDisease() != null
                && request.getOtherDisease().isBlank()) {
            throw new BusinessException("Please remove invalid disease details when not diabetic");
        }
    }

    private void validateAdditionalAttributes(final List<AdditionalAttributeDto> attributes) {
        if (attributes == null || attributes.isEmpty()) {
            return;
        }
        Set<String> normalizedKeys = new HashSet<>();
        for (AdditionalAttributeDto attribute : attributes) {
            String key = attribute.getKey() == null ? null : attribute.getKey().trim().toLowerCase(Locale.ROOT);
            if (key == null || key.isBlank()) {
                throw new BusinessException("Additional attribute key must not be blank");
            }
            if (!normalizedKeys.add(key)) {
                throw new BusinessException("Additional attribute keys must be unique");
            }
            if (attribute.getValue() == null || attribute.getValue().isBlank()) {
                throw new BusinessException("Additional attribute value must not be blank");
            }
        }
    }
}
