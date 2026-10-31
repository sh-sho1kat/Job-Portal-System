package com.sho1kat.controller;

import com.sho1kat.dto.jobPreferenceDto.request.SavedJobRequest;
import com.sho1kat.dto.jobPreferenceDto.response.SavedJobResponse;
import com.sho1kat.client.SavedJobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Candidate job bookmarks. Identity uses the temporary {@code X-User-Id}
 * stand-in header (see {@link RequesterId}) until JWT enforcement lands.
 */
@RestController
@RequestMapping("/api/preferences/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {

    private final SavedJobService savedJobService;

    //List view of the caller's bookmarks, newest first.
    @GetMapping
    public ResponseEntity<List<SavedJobResponse>> getMySavedJobs(
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        return ResponseEntity.ok(savedJobService.getSavedJobs(RequesterId.from(requesterId)));
    }

    //201; saving a job that is already bookmarked answers 409.
    @PostMapping
    public ResponseEntity<SavedJobResponse> saveJob(
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @Valid @RequestBody SavedJobRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedJobService.saveJob(RequesterId.from(requesterId), request));
    }

    //Bookmark probe for the job list UI (checkbox state).
    @GetMapping("/check")
    public ResponseEntity<Boolean> isSaved(
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @RequestParam Long jobId) {
        return ResponseEntity.ok(savedJobService.isSaved(RequesterId.from(requesterId), jobId));
    }

    //204; bookmarks belonging to another candidate answer 404.
    @DeleteMapping("/{savedJobId}")
    public ResponseEntity<Void> unsaveJob(
            @PathVariable Long savedJobId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        savedJobService.unsaveJob(RequesterId.from(requesterId), savedJobId);
        return ResponseEntity.noContent().build();
    }
}
