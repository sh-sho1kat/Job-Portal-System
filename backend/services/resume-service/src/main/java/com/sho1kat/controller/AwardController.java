package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.AwardRequest;
import com.sho1kat.dto.ResumeServiceDto.response.AwardResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.AwardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Award Controller",
        description = "Controller for managing awards and honours of a resume"
)
@RestController
@RequestMapping("/api/resumes/{resumeId}/awards")
@RequiredArgsConstructor
public class AwardController {

    private final AwardService awardService;

    @GetMapping
    public ResponseEntity<List<AwardResponse>> getAwards(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(awardService.getAwards(resumeId, RequesterContext.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<AwardResponse> addAward(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody AwardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(awardService.addAward(resumeId, RequesterContext.from(candidateId), request));
    }

    @PutMapping("/{awardId}")
    public ResponseEntity<AwardResponse> updateAward(
            @PathVariable Long resumeId,
            @PathVariable Long awardId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody AwardRequest request) {
        return ResponseEntity.ok(awardService.updateAward(
                awardId, resumeId, RequesterContext.from(candidateId), request));
    }

    @DeleteMapping("/{awardId}")
    public ResponseEntity<Void> deleteAward(
            @PathVariable Long resumeId,
            @PathVariable Long awardId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        awardService.deleteAward(awardId, resumeId, RequesterContext.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
