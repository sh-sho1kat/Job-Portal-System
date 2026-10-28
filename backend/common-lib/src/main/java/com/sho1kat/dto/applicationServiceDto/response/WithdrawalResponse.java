package com.sho1kat.dto.applicationServiceDto.response;

import java.time.Instant;

/**
 * Withdrawal details of an application; only present when the status is
 * {@code WITHDRAWN}.
 */
public record WithdrawalResponse(
        String withdrawnReason,
        Instant withdrawnAt
) {
}
