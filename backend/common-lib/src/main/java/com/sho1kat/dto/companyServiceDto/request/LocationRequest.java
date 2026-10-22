package com.sho1kat.dto.companyServiceDto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LocationRequest(
        @Size(max = 100, message = "label must be at most 100 characters")
        String label,

        @Size(max = 255, message = "addressLine must be at most 255 characters")
        String addressLine,

        @NotBlank(message = "city is required")
        @Size(max = 100, message = "city must be at most 100 characters")
        String city,

        @Size(max = 100, message = "state must be at most 100 characters")
        String state,

        @NotBlank(message = "country is required")
        @Size(max = 100, message = "country must be at most 100 characters")
        String country,

        @Size(max = 20, message = "postalCode must be at most 20 characters")
        String postalCode,

        /** true makes this the headquarters; any previous headquarters is demoted. */
        Boolean headquarters
) {
}

