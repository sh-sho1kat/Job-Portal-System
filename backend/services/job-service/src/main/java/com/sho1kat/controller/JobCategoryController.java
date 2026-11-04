package com.sho1kat.controller;

import com.sho1kat.dto.jobServiceDto.request.JobCategoryRequest;
import com.sho1kat.dto.jobServiceDto.response.JobCategoryResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.JobCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-categories")
@RequiredArgsConstructor
public class JobCategoryController {

    private final JobCategoryService jobCategoryService;

    // ---- public ----
    @GetMapping
    @Operation(summary = "Get all active job categories", description = "Returns a tree structure of active job categories")
    public ResponseEntity<List<JobCategoryResponse>> getAllJobCategories() {
        return ResponseEntity.ok(jobCategoryService.getAllJobCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobCategoryResponse> getJobCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(jobCategoryService.getJobCategoryById(id));
    }

    // ---- admin / employer ----
    @GetMapping("/all")
    @Operation(summary = "Get all job categories including inactive ones", description = "Requires authentication")
    public ResponseEntity<List<JobCategoryResponse>> getAllJobCategoriesIncludingInactive(
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId) {
        RequesterContext.from(requesterId); // authenticated callers only
        return ResponseEntity.ok(jobCategoryService.getAllJobCategoriesIncludingInactive());
    }

    @PostMapping
    public ResponseEntity<JobCategoryResponse> createJobCategory(
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobCategoryService.createJobCategory(RequesterContext.from(requesterId), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobCategoryResponse> updateJobCategory(
            @PathVariable Long id,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobCategoryRequest request) {
        return ResponseEntity.ok(jobCategoryService.updateJobCategory(id, RequesterContext.from(requesterId), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobCategory(
            @PathVariable Long id,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId) {
        jobCategoryService.deleteJobCategory(id, RequesterContext.from(requesterId));
        return ResponseEntity.noContent().build();
    }
}
