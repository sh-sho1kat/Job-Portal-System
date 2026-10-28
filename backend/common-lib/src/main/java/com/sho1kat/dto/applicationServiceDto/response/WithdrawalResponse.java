package com.sho1kat.dto.applicationServiceDto.response;

import java.time.Instant;

public record WithdrawalResponse(
        String withdrawnReason,
        Instant withdrawnAt
) {
}
