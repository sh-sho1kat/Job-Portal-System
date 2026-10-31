package com.sho1kat.controller;

import com.sho1kat.dto.aiServiceDto.request.CoverLetterRequest;
import com.sho1kat.dto.aiServiceDto.request.ScreeningScoreRequest;
import com.sho1kat.dto.aiServiceDto.request.SkillsGapRequest;
import com.sho1kat.dto.aiServiceDto.response.AiTextResponse;
import com.sho1kat.dto.aiServiceDto.response.ScreeningScoreResponse;
import com.sho1kat.dto.aiServiceDto.response.SkillsGapResponse;
import com.sho1kat.service.ApplicationAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Application-flow AI: personalized cover-letter generation for the apply
 * form, plus candidate-vs-job screening scores and skills-gap analyses (the
 * data behind the application-service inbox screening columns).
 */
@RestController
@RequestMapping("/api/ai/application")
@RequiredArgsConstructor
public class AiApplicationController {

    private final ApplicationAiService applicationAiService;

    @PostMapping("/cover-letter")
    public ResponseEntity<AiTextResponse> generateCoverLetter(@Valid @RequestBody CoverLetterRequest request) {
        return ResponseEntity.ok(applicationAiService.generateCoverLetter(request));
    }

    @PostMapping("/screening-score")
    public ResponseEntity<ScreeningScoreResponse> scoreCandidate(@Valid @RequestBody ScreeningScoreRequest request) {
        return ResponseEntity.ok(applicationAiService.scoreCandidate(request));
    }

    @PostMapping("/skills-gap")
    public ResponseEntity<SkillsGapResponse> analyzeSkillsGap(@Valid @RequestBody SkillsGapRequest request) {
        return ResponseEntity.ok(applicationAiService.analyzeSkillsGap(request));
    }
}
