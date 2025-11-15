package com.ficticia.ficticia_client_service.api.dtos;

import java.util.List;

/**
 * Represents the data returned to clients when interacting with person resources.
 */
public class PersonResponse {

    private Long id;
    private String fullName;
    private String identification;
    private Integer age;
    private String gender;
    private Boolean active;
    private Boolean drives;
    private Boolean wearsGlasses;
    private Boolean diabetic;
    private String otherDisease;
    private List<AdditionalAttributeDto> additionalAttributes;

    /**
     * Creates an empty {@link PersonResponse} instance.
     */
    public PersonResponse() {
        // Default constructor for serialization frameworks.
    }

    /**
     * Retrieves the identifier of the person.
     *
     * @return unique person identifier
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the identifier of the person.
     *
     * @param id unique person identifier
     */
    public void setId(final Long id) {
        this.id = id;
    }

    /**
     * Retrieves the full name returned to clients.
     *
     * @return person's full name
     */
    public String getFullName() {
        return fullName;
    }

    /**
     * Sets the full name returned to clients.
     *
     * @param fullName person's full name
     */
    public void setFullName(final String fullName) {
        this.fullName = fullName;
    }

    /**
     * Retrieves the identification string.
     *
     * @return identification string
     */
    public String getIdentification() {
        return identification;
    }

    /**
     * Sets the identification string.
     *
     * @param identification identification string
     */
    public void setIdentification(final String identification) {
        this.identification = identification;
    }

    /**
     * Retrieves the person's age.
     *
     * @return age value
     */
    public Integer getAge() {
        return age;
    }

    /**
     * Sets the person's age.
     *
     * @param age age value
     */
    public void setAge(final Integer age) {
        this.age = age;
    }

    /**
     * Retrieves the person's gender.
     *
     * @return gender value
     */
    public String getGender() {
        return gender;
    }

    /**
     * Sets the person's gender.
     *
     * @param gender gender value
     */
    public void setGender(final String gender) {
        this.gender = gender;
    }

    /**
     * Indicates whether the person is active.
     *
     * @return active flag
     */
    public Boolean getActive() {
        return active;
    }

    /**
     * Sets the active flag.
     *
     * @param active active flag
     */
    public void setActive(final Boolean active) {
        this.active = active;
    }

    /**
     * Indicates whether the person drives.
     *
     * @return drives flag
     */
    public Boolean getDrives() {
        return drives;
    }

    /**
     * Sets the drives flag.
     *
     * @param drives drives flag
     */
    public void setDrives(final Boolean drives) {
        this.drives = drives;
    }

    /**
     * Indicates whether the person wears glasses.
     *
     * @return wears glasses flag
     */
    public Boolean getWearsGlasses() {
        return wearsGlasses;
    }

    /**
     * Sets the wears glasses flag.
     *
     * @param wearsGlasses wears glasses flag
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
     * @param diabetic diabetic flag
     */
    public void setDiabetic(final Boolean diabetic) {
        this.diabetic = diabetic;
    }

    /**
     * Retrieves the additional disease description.
     *
     * @return optional disease description
     */
    public String getOtherDisease() {
        return otherDisease;
    }

    /**
     * Sets the additional disease description.
     *
     * @param otherDisease optional disease description
     */
    public void setOtherDisease(final String otherDisease) {
        this.otherDisease = otherDisease;
    }

    /**
     * Retrieves the additional attributes associated with the person.
     *
     * @return list of additional attributes
     */
    public List<AdditionalAttributeDto> getAdditionalAttributes() {
        return additionalAttributes;
    }

    /**
     * Sets the additional attributes associated with the person.
     *
     * @param additionalAttributes list of additional attributes
     */
    public void setAdditionalAttributes(final List<AdditionalAttributeDto> additionalAttributes) {
        this.additionalAttributes = additionalAttributes;
    }
}
