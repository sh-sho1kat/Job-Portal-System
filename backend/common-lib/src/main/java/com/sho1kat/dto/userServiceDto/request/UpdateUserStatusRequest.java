package com.sho1kat.dto.userServiceDto.request;

import com.sho1kat.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(

        @NotNull(message = "Status is required")
        UserStatus status
) {
}