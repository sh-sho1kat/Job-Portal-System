package com.sho1kat.dto.companyServiceDto.request;

import com.sho1kat.enums.SocialPlatform;
import com.sho1kat.util.RegexPatterns;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SocialLinkRequest(
        @NotNull(message = "platform is required")
        SocialPlatform platform,

        @NotBlank(message = "url is required")
        @Size(max = 500, message = "url must be at most 500 characters")
        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "url must start with http:// or https://")
        String url
) {
}
