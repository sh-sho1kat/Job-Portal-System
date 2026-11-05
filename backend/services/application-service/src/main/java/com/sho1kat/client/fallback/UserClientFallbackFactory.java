package com.sho1kat.client.fallback;

import com.sho1kat.client.UserClient;
import com.sho1kat.dto.userServiceDto.response.CandidateSummaryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;
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

            @Override
            public List<CandidateSummaryResponse> getUserSummaries(String ids) {
                if(ids == null || ids.isBlank()) {
                    return List.of();
                }
                return Arrays.stream(ids.split(","))
                        .map(String::trim)
                        .map(Long::valueOf)
                        .distinct()
                        .map(this::createEmptyCandidateSummary)
                        .toList();
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