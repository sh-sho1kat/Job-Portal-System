package com.sho1kat.entity;

import com.sho1kat.embeddable.JobLocation;
import com.sho1kat.embeddable.SalaryRange;
import com.sho1kat.enums.EmploymentType;
import com.sho1kat.enums.ExperienceLevel;
import com.sho1kat.enums.JobStatus;
import com.sho1kat.enums.SalaryPeriod;
import com.sho1kat.enums.WorkMode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs", indexes = {
        @Index(name = "idx_job_title", columnList = "title"),
        @Index(name = "idx_job_status", columnList = "status"),
        @Index(name = "idx_job_company", columnList = "companyId"),
        @Index(name = "idx_job_deadline", columnList = "applicationDeadline"),
        @Index(name = "idx_job_category", columnList = "category_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long companyId; // company-service id, no cross-service FK

    @Column(nullable = false)
    private Long postedByOwnerId; // user-service id, no cross-service FK

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExperienceLevel experienceLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkMode workMode;

    @Embedded
    private JobLocation jobLocation;

    @Embedded
    private SalaryRange salaryRange;

    @Enumerated(EnumType.STRING)
    private SalaryPeriod salaryPeriod;

    @Builder.Default
    @Column(nullable = false)
    private Integer vacancies = 1;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private JobCategory category;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "job_job_skills",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    @Builder.Default
    private List<JobSkill> skills = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "job_job_tags",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @Builder.Default
    private List<JobTag> tags = new ArrayList<>();

    // applicationDeadline gates new applications; expiresAt hides the listing
    private LocalDate applicationDeadline;
    private LocalDate expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.DRAFT;

    private Instant publishedAt;
    private Instant closedAt;
    private Instant deletedAt;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private Instant createdAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private Instant updatedAt;
}
