package com.sho1kat.repository;

import com.sho1kat.dto.jobServiceDto.request.JobSearchCriteria;
import com.sho1kat.embeddable.JobLocation;
import com.sho1kat.entity.Job;
import com.sho1kat.entity.JobSkill;
import com.sho1kat.entity.JobTag;
import com.sho1kat.enums.JobStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Reusable JPA Specification builders for job queries (public catalogue and
 * admin listings), extracted from the service implementations.
 */
public final class JobSpecification {

    private JobSpecification() {
    }

    /** Public catalogue: active, not deleted, deadline/expiresAt not passed. */
    public static Specification<Job> publicSearch(JobSearchCriteria criteria) {
        List<Specification<Job>> parts = new ArrayList<>();
        parts.add(notDeleted());
        // the public catalogue only ever exposes approved, active jobs ...
        parts.add((root, query, cb) -> cb.equal(root.get("status"), JobStatus.ACTIVE));
        // ... whose application window and listing expiry have not passed
        parts.add(dateNotPassed("applicationDeadline"));
        parts.add(dateNotPassed("expiresAt"));

        if (criteria.keyword() != null && !criteria.keyword().isBlank()) {
            String pattern = like(criteria.keyword());
            parts.add((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.<String>get("title")), pattern),
                    cb.like(cb.lower(root.<String>get("description")), pattern)
            ));
        }
        if (criteria.companyId() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("companyId"), criteria.companyId()));
        }
        if (criteria.employmentType() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("employmentType"), criteria.employmentType()));
        }
        if (criteria.experienceLevel() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("experienceLevel"), criteria.experienceLevel()));
        }
        if (criteria.workMode() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("workMode"), criteria.workMode()));
        }
        if (criteria.location() != null && !criteria.location().isBlank()) {
            String pattern = like(criteria.location());
            parts.add((root, query, cb) -> {
                Path<JobLocation> location = root.get("jobLocation");
                return cb.or(
                        cb.like(cb.lower(cb.coalesce(location.<String>get("city"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(location.<String>get("state"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(location.<String>get("country"), "")), pattern)
                );
            });
        }
        if (criteria.salaryPeriod() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("salaryPeriod"), criteria.salaryPeriod()));
        }
        if (criteria.categoryId() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("category").get("id"), criteria.categoryId()));
        }
        if (criteria.skillIds() != null && !criteria.skillIds().isEmpty()) {
            // jobs carrying ANY of the given skills — joined rows can duplicate a job
            // in the page, so mark the query distinct (same trick as company locations)
            parts.add((root, query, cb) -> {
                query.distinct(true);
                Join<Job, JobSkill> skills = root.join("skills", JoinType.LEFT);
                return skills.get("id").in(criteria.skillIds());
            });
        }
        if (criteria.tagIds() != null && !criteria.tagIds().isEmpty()) {
            parts.add((root, query, cb) -> {
                query.distinct(true);
                Join<Job, JobTag> tags = root.join("tags", JoinType.LEFT);
                return tags.get("id").in(criteria.tagIds());
            });
        }
        return Specification.allOf(parts);
    }

    /** Admin listing: everything not deleted, optional filters. */
    public static Specification<Job> adminList(JobStatus status, Long companyId, String title) {
        List<Specification<Job>> parts = new ArrayList<>();
        parts.add(notDeleted());
        if (status != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (companyId != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("companyId"), companyId));
        }
        if (title != null && !title.isBlank()) {
            parts.add((root, query, cb) -> cb.like(cb.lower(root.<String>get("title")), like(title)));
        }
        return Specification.allOf(parts);
    }

    // ---- helpers ----

    private static Specification<Job> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.<String>get("deletedAt"));
    }

    /** Matches the field directly or via the embedded wrapper (jobLocation.city). */
    private static Specification<Job> dateNotPassed(String field) {
        return (root, query, cb) -> cb.or(
                cb.isNull(root.get(field)),
                cb.greaterThanOrEqualTo(root.<LocalDate>get(field), LocalDate.now())
        );
    }

    private static String like(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }
}
