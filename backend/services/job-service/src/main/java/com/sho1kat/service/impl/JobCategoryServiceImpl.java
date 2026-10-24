package com.sho1kat.service.impl;

import com.sho1kat.dto.jobServiceDto.request.JobCategoryRequest;
import com.sho1kat.dto.jobServiceDto.response.JobCategoryResponse;
import com.sho1kat.entity.JobCategory;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.JobCategoryMapper;
import com.sho1kat.repository.JobCategoryRepository;
import com.sho1kat.repository.JobRepository;
import com.sho1kat.service.JobCategoryService;
import com.sho1kat.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobCategoryServiceImpl implements JobCategoryService {

    private final JobCategoryRepository jobCategoryRepository;
    private final JobRepository jobRepository;
    private final JobCategoryMapper jobCategoryMapper;

    @Override
    @Transactional
    public JobCategoryResponse createJobCategory(Long requesterId, JobCategoryRequest request) {
        verifyUserId(requesterId, "create a job category");

        JobCategory parent = resolveParent(request.parentId());
        JobCategory category = jobCategoryMapper.toEntity(request, convertToSlug(request.name(), null), parent);
        return jobCategoryMapper.toResponse(jobCategoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobCategoryResponse> getAllJobCategories() {
        return buildTree(loadActiveCategories());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobCategoryResponse> getAllJobCategoriesIncludingInactive() {
        return jobCategoryRepository.findAll(org.springframework.data.domain.Sort.by("name").ascending())
                .stream()
                .map(jobCategoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobCategoryResponse getJobCategoryById(Long id) {
        return jobCategoryMapper.toResponse(requireCategory(id));
    }

    @Override
    @Transactional
    public JobCategoryResponse updateJobCategory(Long id, Long requesterId, JobCategoryRequest request) {
        verifyUserId(requesterId, "update a job category");

        JobCategory category = requireCategory(id);
        JobCategory parent = resolveParent(request.parentId());
        ensureNoCycle(category, parent);
        jobCategoryMapper.updateEntity(request, category, parent);
        return jobCategoryMapper.toResponse(jobCategoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteJobCategory(Long id, Long requesterId) {
        verifyUserId(requesterId, "delete a job category");

        JobCategory category = requireCategory(id);
        if (jobCategoryRepository.existsByParentId(id)) {
            throw ApiException.conflict("Category has sub-categories; delete or move them first");
        }
        if (jobRepository.existsActiveJobForCategory(id)) {
            throw ApiException.conflict("Category is still referenced by active jobs; deactivate it instead");
        }
        jobCategoryRepository.delete(category);
    }

    // ---- helpers ----

    private JobCategory resolveParent(Long parentId) {
        if (parentId == null) {
            return null;
        }
        JobCategory parent = jobCategoryRepository.findById(parentId)
                .orElseThrow(() -> ApiException.notFound("Parent category not found with id: " + parentId));
        if (!parent.isActive()) {
            throw ApiException.badRequest("Parent category must be active");
        }
        return parent;
    }

    /** Re-parenting a category into its own subtree would corrupt the tree. */
    private void ensureNoCycle(JobCategory category, JobCategory newParent) {
        JobCategory cursor = newParent;
        while (cursor != null) {
            if (cursor.getId().equals(category.getId())) {
                throw ApiException.badRequest("A category cannot be nested inside itself or its descendants");
            }
            cursor = cursor.getParent();
        }
    }

    private JobCategory requireCategory(Long id) {
        return jobCategoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Job category not found with id: " + id));
    }

    private Map<Long, JobCategory> loadActiveCategories() {
        return jobCategoryRepository.findAll(org.springframework.data.domain.Sort.by("name").ascending())
                .stream()
                .filter(JobCategory::isActive)
                .collect(Collectors.toMap(JobCategory::getId, c -> c, (a, b) -> a, LinkedHashMap::new));
    }

    /** Assembles active categories into a root list with nested children (depth-safe via visited set). */
    private List<JobCategoryResponse> buildTree(Map<Long, JobCategory> byId) {
        Map<Long, List<Long>> childrenIds = new HashMap<>();
        byId.values().forEach(category -> {
            if (category.getParent() != null && byId.containsKey(category.getParent().getId())) {
                childrenIds.computeIfAbsent(category.getParent().getId(), k -> new ArrayList<>())
                        .add(category.getId());
            }
        });
        return byId.values().stream()
                .filter(category -> category.getParent() == null || !byId.containsKey(category.getParent().getId()))
                .map(root -> toTreeNode(root, byId, childrenIds, new HashSet<>()))
                .toList();
    }

    private JobCategoryResponse toTreeNode(JobCategory category, Map<Long, JobCategory> byId,
                                           Map<Long, List<Long>> childrenIds, Set<Long> visited) {
        if (!visited.add(category.getId())) {
            return jobCategoryMapper.toResponse(category, List.of()); // defensive: data cycle guard
        }
        List<JobCategoryResponse> children = childrenIds.getOrDefault(category.getId(), List.of()).stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .map(child -> toTreeNode(child, byId, childrenIds, visited))
                .toList();
        return jobCategoryMapper.toResponse(category, children);
    }

    private void verifyUserId(Long id, String action) {
        if (id == null) {
            throw ApiException.unauthorized("Authentication is required to " + action);
        }
    }

    private String convertToSlug(String name, String currentSlug) {
        String base = SlugUtils.slugify(name, "category");
        String candidate = base;
        int suffix = 2;
        while (jobCategoryRepository.existsBySlug(candidate) && !candidate.equals(currentSlug)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }
}
