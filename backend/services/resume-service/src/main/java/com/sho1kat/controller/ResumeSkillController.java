package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.ResumeSkillRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeSkillResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.ResumeSkillService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Resume Skills", description = "Operations for managing skills associated with a candidate's resume")
@RestController
@RequestMapping("/api/resumes/{resumeId}/skills")
@RequiredArgsConstructor
public class ResumeSkillController {

    private final ResumeSkillService resumeSkillService;

    @GetMapping
    public ResponseEntity<List<ResumeSkillResponse>> getSkills(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(resumeSkillService.getSkills(resumeId, RequesterContext.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<ResumeSkillResponse> addSkill(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody ResumeSkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeSkillService.addSkill(resumeId, RequesterContext.from(candidateId), request));
    }

    @PutMapping("/{skillId}")
    public ResponseEntity<ResumeSkillResponse> updateSkill(
            @PathVariable Long resumeId,
            @PathVariable Long skillId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody ResumeSkillRequest request) {
        return ResponseEntity.ok(resumeSkillService.updateSkill(
                skillId, resumeId, RequesterContext.from(candidateId), request));
    }

    @DeleteMapping("/{skillId}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable Long resumeId,
            @PathVariable Long skillId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        resumeSkillService.deleteSkill(skillId, resumeId, RequesterContext.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
