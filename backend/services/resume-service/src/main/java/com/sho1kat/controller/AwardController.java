package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.AwardRequest;
import com.sho1kat.dto.ResumeServiceDto.response.AwardResponse;
import com.sho1kat.client.AwardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Awards and honours of one resume; every endpoint is owner-scoped.
 */
@RestController
@RequestMapping("/api/resumes/{resumeId}/awards")
@RequiredArgsConstructor
public class AwardController {

    private final AwardService awardService;

    @GetMapping
    public ResponseEntity<List<AwardResponse>> getAwards(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(awardService.getAwards(resumeId, RequesterId.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<AwardResponse> addAward(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody AwardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(awardService.addAward(resumeId, RequesterId.from(candidateId), request));
    }

    @PutMapping("/{awardId}")
    public ResponseEntity<AwardResponse> updateAward(
            @PathVariable Long resumeId,
            @PathVariable Long awardId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody AwardRequest request) {
        return ResponseEntity.ok(awardService.updateAward(
                awardId, resumeId, RequesterId.from(candidateId), request));
    }

    @DeleteMapping("/{awardId}")
    public ResponseEntity<Void> deleteAward(
            @PathVariable Long resumeId,
            @PathVariable Long awardId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        awardService.deleteAward(awardId, resumeId, RequesterId.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
