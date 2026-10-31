package com.sho1kat.controller;

import com.sho1kat.dto.aiServiceDto.request.JobAlertSuggestionRequest;
import com.sho1kat.dto.aiServiceDto.request.SearchEnhanceRequest;
import com.sho1kat.dto.aiServiceDto.response.JobAlertSuggestionResponse;
import com.sho1kat.dto.aiServiceDto.response.SearchEnhanceResponse;
import com.sho1kat.service.SearchAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Natural-language job search: turns a free sentence into structured,
 * filter-ready search criteria and suggests job-alert criteria from a
 * candidate profile.
 */
@RestController
@RequestMapping("/api/ai/search")
@RequiredArgsConstructor
public class AiSearchController {

    private final SearchAiService searchAiService;

    @PostMapping("/enhance")
    public ResponseEntity<SearchEnhanceResponse> enhanceSearch(@Valid @RequestBody SearchEnhanceRequest request) {
        return ResponseEntity.ok(searchAiService.enhanceSearch(request));
    }

    @PostMapping("/alert-suggestion")
    public ResponseEntity<JobAlertSuggestionResponse> suggestAlertCriteria(
            @Valid @RequestBody JobAlertSuggestionRequest request) {
        return ResponseEntity.ok(searchAiService.suggestAlertCriteria(request));
    }
}
