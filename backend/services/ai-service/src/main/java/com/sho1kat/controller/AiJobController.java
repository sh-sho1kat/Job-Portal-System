package com.sho1kat.controller;

import com.sho1kat.dto.aiServiceDto.request.JobDescriptionRequest;
import com.sho1kat.dto.aiServiceDto.request.JobTextInputRequest;
import com.sho1kat.dto.aiServiceDto.request.SalaryRangeRequest;
import com.sho1kat.dto.aiServiceDto.response.AiTextResponse;
import com.sho1kat.dto.aiServiceDto.response.SalaryRangeResponse;
import com.sho1kat.service.JobAiService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Employer-facing auto-generation for the job posting form: description,
 * requirements/responsibilities/benefits blocks, skill & tag suggestions and a
 * salary band. The lightweight text builders take query params; structured
 * generation takes JSON bodies.
 */
@RestController
@Validated
@RequestMapping("/api/ai/job")
@RequiredArgsConstructor
public class AiJobController {

    private final JobAiService jobAiService;

    @PostMapping("/description")
    public ResponseEntity<AiTextResponse> generateDescription(@Valid @RequestBody JobDescriptionRequest request) {
        return ResponseEntity.ok(jobAiService.generateDescription(request));
    }

    @PostMapping("/requirements")
    public ResponseEntity<AiTextResponse> generateRequirements(
            @RequestParam @NotBlank(message = "Job title is required")
            @Size(max = 150, message = "Job title cannot exceed 150 characters") String title,
            @RequestParam(required = false)
            @Size(max = 100, message = "Category cannot exceed 100 characters") String category) {
        return ResponseEntity.ok(jobAiService.generateRequirements(title, category));
    }

    @PostMapping("/responsibilities")
    public ResponseEntity<AiTextResponse> generateResponsibilities(
            @RequestParam @NotBlank(message = "Job title is required")
            @Size(max = 150, message = "Job title cannot exceed 150 characters") String title,
            @RequestParam(required = false)
            @Size(max = 100, message = "Category cannot exceed 100 characters") String category) {
        return ResponseEntity.ok(jobAiService.generateResponsibilities(title, category));
    }

    @PostMapping("/benefits")
    public ResponseEntity<AiTextResponse> generateBenefits(
            @RequestParam @NotBlank(message = "Job title is required")
            @Size(max = 150, message = "Job title cannot exceed 150 characters") String title,
            @RequestParam(required = false)
            @Size(max = 100, message = "Category cannot exceed 100 characters") String category,
            @RequestParam(required = false)
            @Size(max = 50, message = "Job type cannot exceed 50 characters") String jobType) {
        return ResponseEntity.ok(jobAiService.generateBenefits(title, category, jobType));
    }

    @PostMapping("/skills")
    public ResponseEntity<AiTextResponse> suggestSkills(@Valid @RequestBody JobTextInputRequest request) {
        return ResponseEntity.ok(jobAiService.suggestSkills(request));
    }

    @PostMapping("/tags")
    public ResponseEntity<AiTextResponse> suggestTags(@Valid @RequestBody JobTextInputRequest request) {
        return ResponseEntity.ok(jobAiService.suggestTags(request));
    }

    @PostMapping("/salary-suggestion")
    public ResponseEntity<SalaryRangeResponse> suggestSalary(@Valid @RequestBody SalaryRangeRequest request) {
        return ResponseEntity.ok(jobAiService.suggestSalaryRange(request));
    }
}
