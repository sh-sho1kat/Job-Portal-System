package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.ResumeSkillRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeSkillResponse;
import com.sho1kat.client.ResumeSkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Skills of one resume (candidate-authored names, unlike the job-service
 * taxonomy); every endpoint is owner-scoped.
 */
@RestController
@RequestMapping("/api/resumes/{resumeId}/skills")
@RequiredArgsConstructor
public class ResumeSkillController {

    private final ResumeSkillService resumeSkillService;

    @GetMapping
    public ResponseEntity<List<ResumeSkillResponse>> getSkills(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(resumeSkillService.getSkills(resumeId, RequesterId.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<ResumeSkillResponse> addSkill(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody ResumeSkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeSkillService.addSkill(resumeId, RequesterId.from(candidateId), request));
    }

    @PutMapping("/{skillId}")
    public ResponseEntity<ResumeSkillResponse> updateSkill(
            @PathVariable Long resumeId,
            @PathVariable Long skillId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody ResumeSkillRequest request) {
        return ResponseEntity.ok(resumeSkillService.updateSkill(
                skillId, resumeId, RequesterId.from(candidateId), request));
    }

    @DeleteMapping("/{skillId}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable Long resumeId,
            @PathVariable Long skillId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        resumeSkillService.deleteSkill(skillId, resumeId, RequesterId.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
