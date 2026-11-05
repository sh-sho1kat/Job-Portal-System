package com.sho1kat.client.fallback;

import com.sho1kat.client.UserClient;
import com.sho1kat.dto.userServiceDto.response.CandidateSummaryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class UserClientFallbackFactory
        implements FallbackFactory<UserClient> {

    @Override
    public UserClient create(Throwable cause) {

        log.warn("User service unavailable: {}", cause.getMessage());

        return new UserClient() {

            @Override
            public CandidateSummaryResponse getUserSummary(Long id) {
                return createEmptyCandidateSummary(id);
            }

            private CandidateSummaryResponse createEmptyCandidateSummary(Long id) {
                return new CandidateSummaryResponse(
                        id,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                );
            }
        };
    }
}