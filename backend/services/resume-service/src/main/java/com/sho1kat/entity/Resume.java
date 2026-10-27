package com.sho1kat.entity;

import com.sho1kat.enums.ResumeTemplateType;
import com.sho1kat.enums.ResumeVisibility;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
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

import java.time.Instant;

@Entity
@Table(name = "resumes", indexes = {
        @Index(name = "idx_resume_candidate", columnList = "candidateId"),
        @Index(name = "idx_resume_title", columnList = "title")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidateId; // user-service id, no cross-service FK

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ResumeTemplateType template = ResumeTemplateType.DEFAULT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ResumeVisibility visibility = ResumeVisibility.PRIVATE;

    /**
     * The version used automatically when the candidate applies for a job.
     */
    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean defaultResume = false;

    @Embedded
    private PersonalInfo personalInfo;

    @Column(columnDefinition = "TEXT")
    private String summary;

    /** 0-100 heuristic; see ResumeServiceImpl for the exact checklist. */
    @Column(nullable = false)
    @Builder.Default
    private Integer completionScore = 0;

    private Instant lastViewedAt;

    private Instant deletedAt; // soft delete; queries must filter on deletedAt

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private Instant createdAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private Instant updatedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
