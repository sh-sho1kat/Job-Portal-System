package com.sho1kat.mapper;

import com.sho1kat.dto.jobServiceDto.request.CreateJobRequest;
import com.sho1kat.dto.jobServiceDto.request.UpdateJobRequest;
import com.sho1kat.dto.jobServiceDto.response.CompanySummaryResponse;
import com.sho1kat.dto.jobServiceDto.response.DetailedJobResponse;
import com.sho1kat.dto.jobServiceDto.response.JobResponse;
import com.sho1kat.embeddable.JobLocation;
import com.sho1kat.embeddable.SalaryRange;
import com.sho1kat.entity.Job;
import com.sho1kat.entity.JobCategory;
import com.sho1kat.entity.JobSkill;
import com.sho1kat.entity.JobTag;
import com.sho1kat.enums.JobStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class JobMapper {

    /**
     * New jobs always start pending admin approval; the slug is generated in the
     * service layer (it must check uniqueness against the repository first) and
     * taxonomy references are resolved in the service layer (existence checks).
     */
    public Job toEntity(CreateJobRequest request, Long ownerId, String slug,
                        JobCategory category, List<JobSkill> skills, List<JobTag> tags) {
        return Job.builder()
                .companyId(request.companyId())
                .postedByOwnerId(ownerId)
                .title(request.title().trim())
                .slug(slug)
                .description(request.description().trim())
                .responsibilities(trimToNull(request.responsibilities()))
                .requirements(trimToNull(request.requirements()))
                .benefits(trimToNull(request.benefits()))
                .employmentType(request.employmentType())
                .experienceLevel(request.experienceLevel())
                .workMode(request.workMode())
                .jobLocation(toLocation(request.address(), request.city(), request.state(), request.country(), request.zipCode()))
                .salaryRange(toSalaryRange(request.salaryMin(), request.salaryMax(), request.salaryCurrency()))
                .salaryPeriod(request.salaryPeriod())
                .vacancies(request.vacancies())
                .category(category)
                .skills(new ArrayList<>(skills))
                .tags(new ArrayList<>(tags))
                .applicationDeadline(request.applicationDeadline())
                .expiresAt(request.expiresAt())
                .status(JobStatus.DRAFT)
                .build();
    }

    public JobResponse toResponse(Job job) {
        return new JobResponse(
                job.getId(),
                job.getCompanyId(),
                companySummary(job),
                job.getTitle(),
                job.getDescription(),
                job.getResponsibilities(),
                job.getRequirements(),
                job.getBenefits(),
                address(job), city(job), state(job), country(job), zipCode(job),
                job.getEmploymentType(),
                job.getExperienceLevel(),
                job.getWorkMode(),
                job.getCategory().getId(),
                job.getSkills().stream().map(JobSkill::getId).toList(),
                job.getTags().stream().map(JobTag::getId).toList(),
                salaryMin(job), salaryMax(job), currency(job),
                job.getSalaryPeriod(),
                job.getVacancies(),
                job.getApplicationDeadline(),
                job.getExpiresAt(),
                job.getStatus(),
                job.getPublishedAt(),
                job.getCreatedAt()
        );
    }

    public DetailedJobResponse toDetailedResponse(Job job) {
        return new DetailedJobResponse(
                job.getId(),
                job.getCompanyId(),
                job.getPostedByOwnerId(),
                companySummary(job),
                job.getTitle(),
                job.getDescription(),
                job.getResponsibilities(),
                job.getRequirements(),
                job.getBenefits(),
                address(job), city(job), state(job), country(job), zipCode(job),
                job.getEmploymentType(),
                job.getExperienceLevel(),
                job.getWorkMode(),
                job.getCategory().getId(),
                job.getSkills().stream().map(JobSkill::getId).toList(),
                job.getTags().stream().map(JobTag::getId).toList(),
                salaryMin(job), salaryMax(job), currency(job),
                job.getSalaryPeriod(),
                job.getVacancies(),
                job.getApplicationDeadline(),
                job.getExpiresAt(),
                job.getStatus(),
                0L, // viewCount — wired up with the application service
                0L, // applicationCount — wired up with the application service
                job.getPublishedAt(),
                job.getClosedAt(),
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }

    public void updateEntity(UpdateJobRequest request, Job job,
                             JobCategory category, List<JobSkill> skills, List<JobTag> tags) {
        job.setTitle(request.title().trim());
        job.setDescription(request.description().trim());
        job.setResponsibilities(trimToNull(request.responsibilities()));
        job.setRequirements(trimToNull(request.requirements()));
        job.setBenefits(trimToNull(request.benefits()));
        job.setEmploymentType(request.employmentType());
        job.setExperienceLevel(request.experienceLevel());
        job.setWorkMode(request.workMode());
        job.setJobLocation(toLocation(request.address(), request.city(), request.state(), request.country(), request.zipCode()));
        job.setSalaryRange(toSalaryRange(request.salaryMin(), request.salaryMax(), request.salaryCurrency()));
        job.setSalaryPeriod(request.salaryPeriod());
        job.setVacancies(request.vacancies());
        job.setCategory(category);
        job.getSkills().clear();
        job.getSkills().addAll(skills);
        job.getTags().clear();
        job.getTags().addAll(tags);
        job.setApplicationDeadline(request.applicationDeadline());
        job.setExpiresAt(request.expiresAt());
    }

    // ---- helpers ----

    /**
     * TODO: populated once job-service can look companies up in company-service
     * (service discovery pending); only the id is known locally.
     */
    private CompanySummaryResponse companySummary(Job job) {
        return new CompanySummaryResponse(job.getCompanyId(), null, null, null, null);
    }

    private JobLocation toLocation(String address, String city, String state, String country, String zipCode) {
        return JobLocation.builder()
                .address(trimToNull(address))
                .city(trimToNull(city))
                .state(trimToNull(state))
                .country(trimToNull(country))
                .zipCode(trimToNull(zipCode))
                .build();
    }

    private SalaryRange toSalaryRange(BigDecimal salaryMin, BigDecimal salaryMax, String currency) {
        return SalaryRange.builder()
                .salaryMin(salaryMin)
                .salaryMax(salaryMax)
                .currency(normalizeCurrency(currency))
                .build();
    }

    // convenience accessors for flattened API fields
    private String address(Job job) { return job.getJobLocation() != null ? job.getJobLocation().getAddress() : null; }
    private String city(Job job) { return job.getJobLocation() != null ? job.getJobLocation().getCity() : null; }
    private String state(Job job) { return job.getJobLocation() != null ? job.getJobLocation().getState() : null; }
    private String country(Job job) { return job.getJobLocation() != null ? job.getJobLocation().getCountry() : null; }
    private String zipCode(Job job) { return job.getJobLocation() != null ? job.getJobLocation().getZipCode() : null; }

    private BigDecimal salaryMin(Job job) { return job.getSalaryRange() != null ? job.getSalaryRange().getSalaryMin() : null; }
    private BigDecimal salaryMax(Job job) { return job.getSalaryRange() != null ? job.getSalaryRange().getSalaryMax() : null; }
    private String currency(Job job) { return job.getSalaryRange() != null ? job.getSalaryRange().getCurrency() : null; }

    private String normalizeCurrency(String currency) {
        String trimmed = trimToNull(currency);
        return trimmed == null ? null : trimmed.toUpperCase();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
