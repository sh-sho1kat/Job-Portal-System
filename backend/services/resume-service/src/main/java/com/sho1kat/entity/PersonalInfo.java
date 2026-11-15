package com.sho1kat.entity;

import com.sho1kat.embeddable.Address;
import com.sho1kat.enums.Gender;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalInfo {

    @Column(length = 100)
    private String firstName;

    @Column(length = 100)
    private String middleName;

    @Column(length = 100)
    private String lastName;

    @Column(length = 150)
    private String headline;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 10)
    private String dateOfBirth;

    @Column(length = 100)
    private String nationality;

    @Column(length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "address", column = @Column(name = "present_address", length = 255)),
            @AttributeOverride(name = "city", column = @Column(name = "present_city", length = 100)),
            @AttributeOverride(name = "state", column = @Column(name = "present_state", length = 100)),
            @AttributeOverride(name = "country", column = @Column(name = "present_country", length = 100)),
            @AttributeOverride(name = "zipCode", column = @Column(name = "present_zip_code", length = 20))
    })
    private Address presentAddress;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "address", column = @Column(name = "permanent_address", length = 255)),
            @AttributeOverride(name = "city", column = @Column(name = "permanent_city", length = 100)),
            @AttributeOverride(name = "state", column = @Column(name = "permanent_state", length = 100)),
            @AttributeOverride(name = "country", column = @Column(name = "permanent_country", length = 100)),
            @AttributeOverride(name = "zipCode", column = @Column(name = "permanent_zip_code", length = 20))
    })
    private Address permanentAddress;

    @Column(length = 500)
    private String linkedInUrl;

    @Column(length = 500)
    private String githubUrl;

    @Column(length = 500)
    private String portfolioUrl;

    @Column(length = 500)
    private String websiteUrl;
}
