package com.sho1kat.event;

import com.sho1kat.enums.ApplicationStatus;

public record ApplicationStatusUpdateEvent(
        ApplicationStatus oldStatus,
        ApplicationStatus newStatus,
        String FirstName,
        String MiddleName,
        String LastName,
        String email,
        String jobTitle,
        String companyName
) {
}
