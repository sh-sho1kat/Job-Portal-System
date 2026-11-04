package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.LanguageProficiencyRequest;
import com.sho1kat.dto.ResumeServiceDto.response.LanguageProficiencyResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.LanguageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Language Controller",
        description = "* Spoken languages of one resume; every endpoint is owner-scoped."
)
@RestController
@RequestMapping("/api/resumes/{resumeId}/languages")
@RequiredArgsConstructor
public class LanguageController {

    private final LanguageService languageService;

    @GetMapping
    public ResponseEntity<List<LanguageProficiencyResponse>> getLanguages(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(languageService.getLanguages(resumeId, RequesterContext.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<LanguageProficiencyResponse> addLanguage(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody LanguageProficiencyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(languageService.addLanguage(resumeId, RequesterContext.from(candidateId), request));
    }

    @PutMapping("/{languageId}")
    public ResponseEntity<LanguageProficiencyResponse> updateLanguage(
            @PathVariable Long resumeId,
            @PathVariable Long languageId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody LanguageProficiencyRequest request) {
        return ResponseEntity.ok(languageService.updateLanguage(
                languageId, resumeId, RequesterContext.from(candidateId), request));
    }

    @DeleteMapping("/{languageId}")
    public ResponseEntity<Void> deleteLanguage(
            @PathVariable Long resumeId,
            @PathVariable Long languageId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        languageService.deleteLanguage(languageId, resumeId, RequesterContext.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
