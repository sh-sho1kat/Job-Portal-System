package com.sho1kat.controller;

import com.sho1kat.dto.jobServiceDto.request.JobCategoryRequest;
import com.sho1kat.dto.jobServiceDto.response.JobCategoryResponse;
import com.sho1kat.service.JobCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Job categories (with sub-categories). CRUD is open to employers/admins for
 * now via the temporary {@code X-User-Id} stand-in; reads are public.
 * When real role enforcement lands, write access should tighten to admins only.
 */
@RestController
@RequestMapping("/api/job-categories")
@RequiredArgsConstructor
public class JobCategoryController {

    private final JobCategoryService jobCategoryService;

    // ---- public ----

    /** Active categories as a tree. */
    @GetMapping
    public ResponseEntity<List<JobCategoryResponse>> getAllJobCategories() {
        return ResponseEntity.ok(jobCategoryService.getAllJobCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobCategoryResponse> getJobCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(jobCategoryService.getJobCategoryById(id));
    }

    // ---- admin / employer ----

    /** Flat list including inactive categories. */
    @GetMapping("/all")
    public ResponseEntity<List<JobCategoryResponse>> getAllJobCategoriesIncludingInactive(
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        RequesterId.from(requesterId); // authenticated callers only
        return ResponseEntity.ok(jobCategoryService.getAllJobCategoriesIncludingInactive());
    }

    @PostMapping
    public ResponseEntity<JobCategoryResponse> createJobCategory(
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobCategoryService.createJobCategory(RequesterId.from(requesterId), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobCategoryResponse> updateJobCategory(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobCategoryRequest request) {
        return ResponseEntity.ok(jobCategoryService.updateJobCategory(id, RequesterId.from(requesterId), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobCategory(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        jobCategoryService.deleteJobCategory(id, RequesterId.from(requesterId));
        return ResponseEntity.noContent().build();
    }
}
