package com.sho1kat.dto.aiServiceDto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/** ATS-friendly bullet points rewritten from a raw work-experience entry. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record WorkExperienceBulletResponse(
        List<String> bullets
) {
}
