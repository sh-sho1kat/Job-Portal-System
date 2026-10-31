package com.sho1kat.controller;

import com.sho1kat.dto.jobServiceDto.response.DetailedJobResponse;
import com.sho1kat.enums.JobStatus;
import com.sho1kat.client.JobAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
public class JobAdminController {

    private final JobAdminService jobAdminService;

    @GetMapping
    public ResponseEntity<Page<DetailedJobResponse>> listJobs(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(jobAdminService.listJobs(status, companyId, title, page, size));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<DetailedJobResponse> getJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobAdminService.getJob(jobId));
    }

    /** ACTIVE -> SUSPENDED */
    @PostMapping("/{jobId}/suspend")
    public ResponseEntity<DetailedJobResponse> suspend(@PathVariable Long jobId,
                                                       @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(jobAdminService.suspend(jobId, reason));
    }

    /** SUSPENDED -> ACTIVE */
    @PostMapping("/{jobId}/reactivate")
    public ResponseEntity<DetailedJobResponse> reactivate(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobAdminService.reactivate(jobId));
    }
}
