package com.sho1kat.service.impl;

import com.sho1kat.dto.ResumeServiceDto.request.ResumeRequest;
import com.sho1kat.dto.ResumeServiceDto.request.PersonalInfoRequest;
import com.sho1kat.dto.ResumeServiceDto.request.UpdateResumeRequest;
import com.sho1kat.dto.ResumeServiceDto.request.UpdateSummaryRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeResponse;
import com.sho1kat.entity.PersonalInfo;
import com.sho1kat.entity.Resume;
import com.sho1kat.enums.ResumeTemplateType;
import com.sho1kat.enums.ResumeVisibility;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.ResumeMapper;
import com.sho1kat.repository.AwardRepository;
import com.sho1kat.repository.CertificationRepository;
import com.sho1kat.repository.EducationRepository;
import com.sho1kat.repository.LanguageRepository;
import com.sho1kat.repository.ProjectRepository;
import com.sho1kat.repository.ResumeRepository;
import com.sho1kat.repository.ResumeSkillRepository;
import com.sho1kat.repository.WorkExperienceRepository;
import com.sho1kat.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private static final int SCORE_PER_CHECK = 10;

    private final ResumeRepository resumeRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final EducationRepository educationRepository;
    private final ResumeSkillRepository resumeSkillRepository;
    private final LanguageRepository languageRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final AwardRepository awardRepository;
    private final ResumeMapper resumeMapper;

    // ---- resume lifecycle ----

    @Override
    @Transactional
    public ResumeResponse createResume(Long candidateId, ResumeRequest request) {
        verifyCandidateId(candidateId, "create a resume");

        String title = request.title() == null ? null : request.title().trim();
        if (title == null || title.isEmpty()) {
            throw ApiException.badRequest("Resume title is required");
        }
        if (resumeRepository.existsByCandidateIdAndTitleIgnoreCaseAndDeletedAtIsNull(candidateId, title)) {
            throw ApiException.conflict("You already have a resume titled '" + title + "'");
        }

        // The first resume is automatically the apply-with default.
        boolean first = resumeRepository
                .findByCandidateIdAndDeletedAtIsNullOrderByDefaultResumeDescCreatedAtDesc(candidateId).isEmpty();

        boolean makeDefault = first || Boolean.TRUE.equals(request.isDefault());
        if (makeDefault) {
            demoteOtherDefaults(candidateId, null);
        }

        Resume savedResume = Resume.builder()
                .candidateId(candidateId)
                .title(title)
                .template(request.template() != null ? request.template() : ResumeTemplateType.DEFAULT)
                .visibility(request.visibility() != null ? request.visibility() : ResumeVisibility.PRIVATE)
                .defaultResume(makeDefault)
                .personalInfo(null)
                .summary(null)
                .completionScore(0)
                .build();
        resumeRepository.save(savedResume);
        return resumeMapper.toSummaryResponse(savedResume);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeResponse> getMyResumes(Long candidateId) {
        verifyCandidateId(candidateId, "view your resumes");
        return resumeRepository.findByCandidateIdAndDeletedAtIsNullOrderByDefaultResumeDescCreatedAtDesc(candidateId)
                .stream()
                .map(resumeMapper::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional
    public ResumeResponse getResumeById(Long resumeId, Long candidateId) {
        Resume resume = requireOwnedResume(resumeId, candidateId);
        resume.setLastViewedAt(Instant.now()); // count only views actually served
        return toDetailResponse(resume);
    }

    @Override
    @Transactional
    public ResumeResponse updateResume(Long resumeId, Long candidateId, UpdateResumeRequest request) {
        Resume resume = requireOwnedResume(resumeId, candidateId);

        if (request.title() != null) {
            String title = request.title().trim();
            if (title.isEmpty()) {
                throw ApiException.badRequest("Resume title cannot be blank");
            }
            if (!title.equalsIgnoreCase(resume.getTitle())
                    && resumeRepository.existsByCandidateIdAndTitleIgnoreCaseAndDeletedAtIsNull(candidateId, title)) {
                throw ApiException.conflict("You already have a resume titled '" + title + "'");
            }
            resume.setTitle(title);
        }
        if (request.template() != null) {
            resume.setTemplate(request.template());
        }
        if (request.visibility() != null) {
            resume.setVisibility(request.visibility());
        }
        return toDetailResponse(resume);
    }

    @Override
    @Transactional
    public ResumeResponse updatePersonalInfo(Long resumeId, Long candidateId, PersonalInfoRequest request) {
        Resume resume = requireOwnedResume(resumeId, candidateId);

        PersonalInfo info = resume.getPersonalInfo() != null
                ? resume.getPersonalInfo()
                : PersonalInfo.builder().build();
        if (request.firstName() != null) info.setFirstName(request.firstName().trim());
        if (request.lastName() != null) info.setLastName(request.lastName().trim());
        if (request.headline() != null) info.setHeadline(request.headline().trim());
        if (request.email() != null) info.setEmail(request.email().trim());
        if (request.phone() != null) info.setPhone(request.phone().trim());
        if (request.city() != null) info.setCity(request.city().trim());
        if (request.country() != null) info.setCountry(request.country().trim());
        if (request.linkedInUrl() != null) info.setLinkedInUrl(request.linkedInUrl().trim());
        if (request.githubUrl() != null) info.setGithubUrl(request.githubUrl().trim());
        if (request.portfolioUrl() != null) info.setPortfolioUrl(request.portfolioUrl().trim());
        if (request.websiteUrl() != null) info.setWebsiteUrl(request.websiteUrl().trim());
        resume.setPersonalInfo(info);

        refreshCompletionScore(resume);
        return toDetailResponse(resume);
    }

    @Override
    @Transactional
    public ResumeResponse updateSummary(Long resumeId, Long candidateId, UpdateSummaryRequest request) {
        Resume resume = requireOwnedResume(resumeId, candidateId);
        resume.setSummary(request.summary() == null ? null : request.summary().trim());
        refreshCompletionScore(resume);
        return toDetailResponse(resume);
    }

    @Override
    @Transactional
    public ResumeResponse setDefaultResume(Long resumeId, Long candidateId) {
        Resume resume = requireOwnedResume(resumeId, candidateId);
        demoteOtherDefaults(candidateId, resumeId);
        if (!resume.isDefaultResume()) {
            resume.setDefaultResume(true);
        }
        return toDetailResponse(resume);
    }

    @Override
    @Transactional
    public void deleteResume(Long resumeId, Long candidateId) {
        Resume resume = requireOwnedResume(resumeId, candidateId);
        resume.setDeletedAt(Instant.now()); // soft delete; queries filter on deletedAt
        resume.setDefaultResume(false);
        resumeRepository.save(resume);

        // Keep an apply-with default whenever another resume survives.
        resumeRepository.findFirstByCandidateIdAndDeletedAtIsNullOrderByCreatedAtDescIdDesc(candidateId)
                .filter(remaining -> !remaining.isDefaultResume())
                .ifPresent(remaining -> {
                    remaining.setDefaultResume(true);
                    resumeRepository.save(remaining);
                });
    }

    // ---- shared helpers for the sub-section services ----

    @Override
    @Transactional(readOnly = true)
    public Resume requireOwnedResume(Long resumeId, Long candidateId) {
        verifyCandidateId(candidateId, "manage this resume");
        Resume resume = resumeRepository.findByIdAndDeletedAtIsNull(resumeId)
                .orElseThrow(() -> ApiException.notFound("Resume not found with id: " + resumeId));
        if (!resume.getCandidateId().equals(candidateId)) {
            throw ApiException.forbidden("Only the resume owner can manage it");
        }
        return resume;
    }

    @Override
    @Transactional
    public void refreshCompletionScore(Resume resume) {
        PersonalInfo info = resume.getPersonalInfo();
        int checks = 0;
        if (info != null && (notBlank(info.getFirstName()) || notBlank(info.getLastName()))) checks++;
        if (info != null && notBlank(info.getEmail())) checks++;
        if (notBlank(resume.getSummary())) checks++;
        if (workExperienceRepository.existsByResumeId(resume.getId())) checks++;
        if (educationRepository.existsByResumeId(resume.getId())) checks++;
        if (resumeSkillRepository.existsByResumeId(resume.getId())) checks++;
        if (projectRepository.existsByResumeId(resume.getId())) checks++;
        if (certificationRepository.existsByResumeId(resume.getId())) checks++;
        if (awardRepository.existsByResumeId(resume.getId())) checks++;
        if (languageRepository.existsByResumeId(resume.getId())) checks++;
        resume.setCompletionScore(checks * SCORE_PER_CHECK);
        // caller flows continue after this; a save keeps carriers consistent
        resumeRepository.save(resume);
    }

    // ---- helpers ----

    /**
     * Detailed view with all sections freshly loaded.
     */
    private ResumeResponse toDetailResponse(Resume resume) {
        return resumeMapper.toDetailResponse(
                resume,
                workExperienceRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId()),
                educationRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId()),
                resumeSkillRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId()),
                projectRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId()),
                certificationRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId()),
                awardRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId()),
                languageRepository.findByResumeIdOrderByDisplayOrderAscIdAsc(resume.getId()));
    }

    /** Clears every other default; resumes whose id equals keepId are untouched. */
    private void demoteOtherDefaults(Long candidateId, Long keepId) {
        resumeRepository.findByCandidateIdAndDeletedAtIsNullOrderByDefaultResumeDescCreatedAtDesc(candidateId)
                .stream()
                .filter(Resume::isDefaultResume)
                .filter(resume -> !resume.getId().equals(keepId))
                .forEach(resume -> {
                    resume.setDefaultResume(false);
                    resumeRepository.save(resume);
                });
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }

    private void verifyCandidateId(Long id, String action) {
        if (id == null) {
            throw ApiException.unauthorized("Authentication is required to " + action);
        }
    }
}
