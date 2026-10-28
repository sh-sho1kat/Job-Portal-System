package com.sho1kat.entity;

import com.sho1kat.enums.AiShortListStatus;
import com.sho1kat.enums.ApplicationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * One candidate's application for one job.
 *
 * Like every service in this system there are no cross-service FKs: candidate,
 * job, company and employer references are loose user/job/company-service ids
 * (TODO: verified once the gateway/service discovery can prove them).
 */
@Entity
@Table(name = "applications", indexes = {
        @Index(name = "idx_application_candidate", columnList = "candidateId"),
        @Index(name = "idx_application_job", columnList = "jobId"),
        @Index(name = "idx_application_company", columnList = "companyId"),
        @Index(name = "idx_application_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** user-service id of the candidate. */
    @Column(nullable = false)
    private Long candidateId;

    /** job-service id; applications are accepted for active postings only. */
    @Column(nullable = false)
    private Long jobId;

    /** company-service id, copied from the job card the candidate applied from. */
    @Column(nullable = false)
    private Long companyId;

    /** resume-service id of the submitted resume (resume-service owns it). */
    @Column(nullable = false)
    private Long resumeId;

    /** Owning employer user id, denormalised from job-service; null until integration. */
    private Long employerId;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    private BigDecimal expectedSalary;

    private LocalDate availableFrom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    /** Bookmark of the reviewing employer. */
    @Column(name = "is_starred", nullable = false)
    @Builder.Default
    private boolean starred = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private AiShortListStatus aiShortListStatus = AiShortListStatus.NOT_SCREENED;

    /** 0-100 AI match score; null while unscreened. */
    private Integer aiScore;

    @Column(columnDefinition = "TEXT")
    private String withdrawnReason;

    private Instant withdrawnAt;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private Instant createdAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private Instant updatedAt;
}
