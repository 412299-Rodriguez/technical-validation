package com.ficticia.ficticia_client_service.api.dtos;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Represents the payload required to create or update a person resource.
 */
public class PersonRequest {

    @NotBlank
    @Size(max = 150)
    private String fullName;

    @NotBlank
    @Size(max = 50)
    private String identification;

    @NotNull
    @Min(18)
    @Max(100)
    private Integer age;

    @NotBlank
    private String gender;

    @NotNull
    private Boolean active;

    @NotNull
    private Boolean drives;

    @NotNull
    private Boolean wearsGlasses;

    @NotNull
    private Boolean diabetic;

    @Size(max = 255)
    private String otherDisease;

    @Valid
    private List<AdditionalAttributeDto> additionalAttributes;

    /**
     * Creates an empty {@link PersonRequest} instance.
     */
    public PersonRequest() {
        // Default constructor required for serialization frameworks.
    }

    /**
     * Retrieves the full name value.
     *
     * @return full name string
     */
    public String getFullName() {
        return fullName;
    }

    /**
     * Sets the full name value.
     *
     * @param fullName new full name string
     */
    public void setFullName(final String fullName) {
        this.fullName = fullName;
    }

    /**
     * Retrieves the identification value.
     *
     * @return identification string
     */
    public String getIdentification() {
        return identification;
    }

    /**
     * Sets the identification value.
     *
     * @param identification new identification string
     */
    public void setIdentification(final String identification) {
        this.identification = identification;
    }

    /**
     * Retrieves the age value.
     *
     * @return age in years
     */
    public Integer getAge() {
        return age;
    }

    /**
     * Sets the age value.
     *
     * @param age new age in years
     */
    public void setAge(final Integer age) {
        this.age = age;
    }

    /**
     * Retrieves the gender value.
     *
     * @return gender string
     */
    public String getGender() {
        return gender;
    }

    /**
     * Sets the gender value.
     *
     * @param gender new gender string
     */
    public void setGender(final String gender) {
        this.gender = gender;
    }

    /**
     * Indicates whether the person is active.
     *
     * @return flag representing the active status
     */
    public Boolean getActive() {
        return active;
    }

    /**
     * Sets the active flag.
     *
     * @param active new active flag value
     */
    public void setActive(final Boolean active) {
        this.active = active;
    }

    /**
     * Indicates whether the person drives.
     *
     * @return flag representing driving status
     */
    public Boolean getDrives() {
        return drives;
    }

    /**
     * Sets the drives flag.
     *
     * @param drives new drives flag value
     */
    public void setDrives(final Boolean drives) {
        this.drives = drives;
    }

    /**
     * Indicates whether the person wears glasses.
     *
     * @return flag representing glasses usage
     */
    public Boolean getWearsGlasses() {
        return wearsGlasses;
    }

    /**
     * Sets the wearsGlasses flag.
     *
     * @param wearsGlasses new flag value
     */
    public void setWearsGlasses(final Boolean wearsGlasses) {
        this.wearsGlasses = wearsGlasses;
    }

    /**
     * Indicates whether the person is diabetic.
     *
     * @return diabetic flag
     */
    public Boolean getDiabetic() {
        return diabetic;
    }

    /**
     * Sets the diabetic flag.
     *
     * @param diabetic new diabetic flag value
     */
    public void setDiabetic(final Boolean diabetic) {
        this.diabetic = diabetic;
    }

    /**
     * Retrieves additional disease information.
     *
     * @return optional disease description
     */
    public String getOtherDisease() {
        return otherDisease;
    }

    /**
     * Sets the additional disease information.
     *
     * @param otherDisease description of other diseases
     */
    public void setOtherDisease(final String otherDisease) {
        this.otherDisease = otherDisease;
    }

    /**
     * Retrieves the supplementary attributes list.
     *
     * @return list of additional attributes
     */
    public List<AdditionalAttributeDto> getAdditionalAttributes() {
        return additionalAttributes;
    }

    /**
     * Sets the supplementary attributes list.
     *
     * @param additionalAttributes new list of additional attributes
     */
    public void setAdditionalAttributes(final List<AdditionalAttributeDto> additionalAttributes) {
        this.additionalAttributes = additionalAttributes;
    }
}
