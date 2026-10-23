package com.sho1kat.embeddable;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Size;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobLocation {
    @Size(max = 255, message = "address must be at most 255 characters")
    private String address;

    @Size(max = 100, message = "city must be at most 100 characters")
    private String city;

    @Size(max = 100, message = "state must be at most 100 characters")
    private String state;

    @Size(max = 100, message = "country must be at most 100 characters")
    private String country;

    @Size(max = 20, message = "zipCode must be at most 20 characters")
    private String zipCode;
}
