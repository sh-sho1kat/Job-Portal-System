package com.sho1kat.event;

public record ApplicationStatusUpdateEvent(
        String oldStatus,
        String newStatus,
        String FirstName,
        String LastName,
        String email,
        String jobTitle,
        String companyName
) {
}
