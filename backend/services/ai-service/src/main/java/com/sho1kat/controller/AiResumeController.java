package com.sho1kat.controller;

import com.sho1kat.dto.aiServiceDto.request.CareerFeedbackRequest;
import com.sho1kat.dto.aiServiceDto.request.ResumeImprovementRequest;
import com.sho1kat.dto.aiServiceDto.request.ResumeSummaryRequest;
import com.sho1kat.dto.aiServiceDto.request.WorkExperienceRequest;
import com.sho1kat.dto.aiServiceDto.response.AiTextResponse;
import com.sho1kat.dto.aiServiceDto.response.CareerFeedbackResponse;
import com.sho1kat.dto.aiServiceDto.response.ResumeImprovementResponse;
import com.sho1kat.dto.aiServiceDto.response.WorkExperienceBulletResponse;
import com.sho1kat.service.ResumeAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Resume optimization endpoints — the resume-service frontend calls these to
 * generate a professional summary, rewrite raw experience entries into ATS
 * bullets, and obtain scored improvement tips / career feedback.
 */
@RestController
@RequestMapping("/api/ai/resume")
@RequiredArgsConstructor
public class AiResumeController {

    private final ResumeAiService resumeAiService;

    @PostMapping("/summary")
    public ResponseEntity<AiTextResponse> generateSummary(@Valid @RequestBody ResumeSummaryRequest request) {
        return ResponseEntity.ok(resumeAiService.generateSummary(request));
    }

    @PostMapping("/experience-bullets")
    public ResponseEntity<WorkExperienceBulletResponse> generateBullets(@Valid @RequestBody WorkExperienceRequest request) {
        return ResponseEntity.ok(resumeAiService.generateExperienceBullets(request));
    }

    @PostMapping("/improvements")
    public ResponseEntity<ResumeImprovementResponse> getImprovements(@Valid @RequestBody ResumeImprovementRequest request) {
        return ResponseEntity.ok(resumeAiService.getImprovementTips(request));
    }

    @PostMapping("/career-feedback")
    public ResponseEntity<CareerFeedbackResponse> getCareerFeedback(@Valid @RequestBody CareerFeedbackRequest request) {
        return ResponseEntity.ok(resumeAiService.getCareerFeedback(request));
    }
}
