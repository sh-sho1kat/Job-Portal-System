package com.sho1kat.repository;

import com.sho1kat.dto.applicationServiceDto.request.CompanyApplicationFilterRequest;
import com.sho1kat.entity.Application;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class ApplicationSpecification {

    private ApplicationSpecification() {
    }

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
        String sortBy = criteria.sortBy();
        if ("starred".equals(sortBy)) {
            // starred first, best AI score among them, newest first
            parts.add((root, query, cb) -> {
                query.orderBy(
                        cb.desc(root.get("starred")),
                        cb.desc(cb.coalesce(root.<Integer>get("aiScore"), -1)),
                        cb.desc(root.get("createdAt")),
                        cb.desc(root.get("id")));
                return cb.conjunction();
            });
        } else if ("aiScoreAsc".equals(sortBy)) {
            // weakest first; unscreened rows (null) sink to the bottom
            parts.add((root, query, cb) -> {
                query.orderBy(
                        cb.asc(cb.coalesce(root.<Integer>get("aiScore"), 101)),
                        cb.desc(root.get("createdAt")),
                        cb.desc(root.get("id")));
                return cb.conjunction();
            });
        } else if ("aiScore".equals(sortBy) || "aiScoreDesc".equals(sortBy)) {
            // strongest first; unscreened rows sink to the bottom
            parts.add((root, query, cb) -> {
                query.orderBy(
                        cb.desc(cb.coalesce(root.<Integer>get("aiScore"), -1)),
                        cb.desc(root.get("createdAt")),
                        cb.desc(root.get("id")));
                return cb.conjunction();
            });
        }
        return Specification.allOf(parts);
    }
}
