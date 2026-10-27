package com.sho1kat.mapper;

import com.sho1kat.dto.ResumeServiceDto.response.PersonalInfoResponse;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeResponse;
import com.sho1kat.entity.Award;
import com.sho1kat.entity.Certification;
import com.sho1kat.entity.Education;
import com.sho1kat.entity.Language;
import com.sho1kat.entity.PersonalInfo;
import com.sho1kat.entity.Project;
import com.sho1kat.entity.Resume;
import com.sho1kat.entity.ResumeSkill;
import com.sho1kat.entity.WorkExperience;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ResumeMapper {

    private final WorkExperienceMapper workExperienceMapper;
    private final EducationMapper educationMapper;
    private final ResumeSkillMapper resumeSkillMapper;
    private final ProjectMapper projectMapper;
    private final CertificationMapper certificationMapper;
    private final AwardMapper awardMapper;
    private final LanguageMapper languageMapper;

    public ResumeResponse toDetailResponse(
            Resume resume,
            List<WorkExperience> workExperiences,
            List<Education> educations,
            List<ResumeSkill> skills,
            List<Project> projects,
            List<Certification> certifications,
            List<Award> awards,
            List<Language> languages) {
        return new ResumeResponse(
                resume.getId(),
                resume.getCandidateId(),
                resume.getTitle(),
                resume.getTemplate(),
                resume.getVisibility(),
                resume.isDefaultResume(),
                toPersonalInfoResponse(resume.getPersonalInfo()),
                resume.getSummary(),
                resume.getCompletionScore(),
                resume.getLastViewedAt(),
                resume.getCreatedAt(),
                resume.getUpdatedAt(),
                mapList(workExperiences, workExperienceMapper::toResponse),
                mapList(educations, educationMapper::toResponse),
                mapList(skills, resumeSkillMapper::toResponse),
                mapList(projects, projectMapper::toResponse),
                mapList(certifications, certificationMapper::toResponse),
                mapList(awards, awardMapper::toResponse),
                mapList(languages, languageMapper::toResponse));
    }

    /** List-view response; subsection lists stay empty, load the detail for them. */
    public ResumeResponse toSummaryResponse(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getCandidateId(),
                resume.getTitle(),
                resume.getTemplate(),
                resume.getVisibility(),
                resume.isDefaultResume(),
                toPersonalInfoResponse(resume.getPersonalInfo()),
                resume.getSummary(),
                resume.getCompletionScore(),
                resume.getLastViewedAt(),
                resume.getCreatedAt(),
                resume.getUpdatedAt(),
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of());
    }

    public PersonalInfoResponse toPersonalInfoResponse(PersonalInfo info) {
        return info == null ? null : new PersonalInfoResponse(
                info.getFirstName(),
                info.getLastName(),
                info.getHeadline(),
                info.getEmail(),
                info.getPhone(),
                info.getCity(),
                info.getCountry(),
                info.getLinkedInUrl(),
                info.getGithubUrl(),
                info.getPortfolioUrl(),
                info.getWebsiteUrl());
    }

    private <T, R> List<R> mapList(List<T> items, java.util.function.Function<T, R> mapper) {
        return items == null ? List.of() : items.stream().map(mapper).toList();
    }
}
