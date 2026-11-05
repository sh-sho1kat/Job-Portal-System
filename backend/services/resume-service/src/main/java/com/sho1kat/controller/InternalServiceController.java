package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.response.ResumeSummaryResponse;
import com.sho1kat.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/resumes")
@RequiredArgsConstructor
public class InternalServiceController {

    private final ResumeService resumeService;

    @GetMapping("/{resumeId}")
    public ResumeSummaryResponse getResume(@PathVariable Long resumeId, @RequestParam("candidateId") Long candidateId) {
        return resumeService.getResumeSummary(resumeId, candidateId);
    }
}