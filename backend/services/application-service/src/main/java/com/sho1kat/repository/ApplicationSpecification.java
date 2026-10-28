package com.sho1kat.repository;

import com.sho1kat.dto.applicationServiceDto.request.CompanyApplicationFilterRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationResponse;
import com.sho1kat.entity.Application;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Reusable JPA Specification for the company application inbox, extracted from
 * the service implementation (same pattern as job-service's JobSpecification).
 */
public final class ApplicationSpecification {

    private ApplicationSpecification() {
    }
    /**
     * Everything the given company can see, narrowed by the optional filter
     * fields. {@code sortBy = "aiScore"} attaches its ordering here so the
     * unscreened (null score) rows sink to the bottom portably.
     */
    public static Specification<Application> companyFilter(
            Long companyId, CompanyApplicationFilterRequest criteria) {
        List<Specification<Application>> parts = new ArrayList<>();
        parts.add((root, query, cb) -> cb.equal(root.get("companyId"), companyId));
        if (criteria.job() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("jobId"), criteria.job()));
        }
        if (criteria.status() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("status"), criteria.status()));
        }
        if (criteria.isStarred() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("starred"), criteria.isStarred()));
        }
        if (criteria.aiShortListStatus() != null) {
            parts.add((root, query, cb) -> cb.equal(root.get("aiShortListStatus"), criteria.aiShortListStatus()));
        }
        if (criteria.minAiScore() != null) {
            parts.add((root, query, cb) -> cb.and(
                    cb.isNotNull(root.<Integer>get("aiScore")),
                    cb.ge(root.<Integer>get("aiScore"), criteria.minAiScore())));
        }
        if ("aiScore".equals(criteria.sortBy())) {
            parts.add((root, query, cb) -> {
                query.orderBy(
                        cb.desc(cb.coalesce(root.<Integer>get("aiScore"), -1)),
                        cb.desc(root.get("id")));
                return cb.conjunction();
            });
        }
        return Specification.allOf(parts);
    }
}
