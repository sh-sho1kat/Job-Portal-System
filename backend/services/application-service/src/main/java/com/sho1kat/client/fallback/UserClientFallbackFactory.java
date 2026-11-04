package com.sho1kat.client.fallback;

import com.sho1kat.client.UserClient;
import com.sho1kat.dto.userServiceDto.response.UserResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UserClientFallbackFactory
        implements FallbackFactory<UserClient> {

    @Override
    public UserClient create(Throwable cause) {

        log.warn("User service unavailable: {}", cause.toString());

        return id -> new UserResponse(
                id,
                null, null, null, null, null,
                null, null, null, null, null, null
        );
    }
}