package com.sho1kat;

import com.sho1kat.dto.ResumeServiceDto.request.AwardRequest;
import com.sho1kat.dto.ResumeServiceDto.request.ResumeRequest;
import com.sho1kat.dto.ResumeServiceDto.request.EducationRequest;
import com.sho1kat.dto.ResumeServiceDto.request.LanguageProficiencyRequest;
import com.sho1kat.dto.ResumeServiceDto.request.PersonalInfoRequest;
import com.sho1kat.dto.ResumeServiceDto.request.ProjectRequest;
import com.sho1kat.dto.ResumeServiceDto.request.ResumeSkillRequest;
import com.sho1kat.dto.ResumeServiceDto.request.UpdateSummaryRequest;
import com.sho1kat.dto.ResumeServiceDto.request.WorkExperienceRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeResponse;
import com.sho1kat.enums.LanguageProficiency;
import com.sho1kat.enums.ProficiencyLevel;
import com.sho1kat.enums.ResumeTemplateType;
import com.sho1kat.enums.ResumeVisibility;
import com.sho1kat.exception.ApiException;
import com.sho1kat.client.AwardService;
import com.sho1kat.client.EducationService;
import com.sho1kat.client.LanguageService;
import com.sho1kat.client.ProjectService;
import com.sho1kat.client.ResumeService;
import com.sho1kat.client.ResumeSkillService;
import com.sho1kat.client.WorkExperienceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Service-level integration tests; runs against the in-memory H2 database
 * (see src/test/resources/application.yaml).
 */
@SpringBootTest
@Transactional
class ResumeServiceApplicationTests {

    private static final long CANDIDATE = 1001L;
    private static final long OTHER_CANDIDATE = 2002L;

    @Autowired
    private ResumeService resumeService;
    @Autowired
    private WorkExperienceService workExperienceService;
    @Autowired
    private EducationService educationService;
    @Autowired
    private ResumeSkillService resumeSkillService;
    @Autowired
    private LanguageService languageService;
    @Autowired
    private AwardService awardService;
    @Autowired
    private ProjectService projectService;

    @Test
    void contextLoads() {
    }

    @Test
    void firstResumeBecomesDefaultAutomatically() {
        ResumeResponse first = resumeService.createResume(CANDIDATE,
                new ResumeRequest("Backend resume", ResumeTemplateType.MODERN,
                        ResumeVisibility.PRIVATE, false));
        assertThat(first.isDefault()).isTrue();

        ResumeResponse second = resumeService.createResume(CANDIDATE,
                new ResumeRequest("Data resume", null, null, false));
        assertThat(second.isDefault()).isFalse();
        assertThat(second.id()).isNotEqualTo(first.id());

        // a requested default flips the flag around
        ResumeResponse retargeted = resumeService.setDefaultResume(second.id(), CANDIDATE);
        assertThat(retargeted.isDefault()).isTrue();
        assertThat(resumeService.getResumeById(first.id(), CANDIDATE).isDefault()).isFalse();
    }

    @Test
    void duplicateTitlesAreRejectedWithinOneCandidate() {
        resumeService.createResume(CANDIDATE, new ResumeRequest("Engineer CV", null, null, null));
        assertThatThrownBy(() -> resumeService.createResume(CANDIDATE,
                new ResumeRequest("engineer cv", null, null, null)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already have a resume");
        // another candidate may use the same title
        resumeService.createResume(OTHER_CANDIDATE, new ResumeRequest("Engineer CV", null, null, null));
    }

    @Test
    void personalInfoIsPatchedFieldWiseAffectingCompletionScore() {
        Long resumeId = resumeService.createResume(CANDIDATE,
                new ResumeRequest("Full-stack CV", null, null, null)).id();
        assertThat(resumeService.getResumeById(resumeId, CANDIDATE).completionScore()).isZero();

        resumeService.updatePersonalInfo(resumeId, CANDIDATE,
                new PersonalInfoRequest("Alex", null, "Backend engineer", "alex@example.com",
                        null, null, null, null, null, null, null));

        ResumeResponse detail = resumeService.getResumeById(resumeId, CANDIDATE);
        assertThat(detail.personalInfo().firstName()).isEqualTo("Alex");
        assertThat(detail.personalInfo().lastName()).isNull();          // unchanged by the patch
        assertThat(detail.completionScore()).isEqualTo(20);             // name + email
        assertThat(detail.lastViewedAt()).isNotNull();                  // the detail view registers a view
    }

    @Test
    void summaryCanBeReplacedAndCleared() {
        Long resumeId = resumeService.createResume(CANDIDATE,
                new ResumeRequest("Mobile CV", null, null, null)).id();

        ResumeResponse withSummary = resumeService.updateSummary(resumeId, CANDIDATE,
                new UpdateSummaryRequest("Android developer"));
        assertThat(withSummary.summary()).isEqualTo("Android developer");
        assertThat(withSummary.completionScore()).isEqualTo(10);

        ResumeResponse cleared = resumeService.updateSummary(resumeId, CANDIDATE, new UpdateSummaryRequest(null));
        assertThat(cleared.summary()).isNull();
        assertThat(cleared.completionScore()).isZero();
    }

    @Test
    void subSectionsAreOwnerScopedAndScoreRelevant() {
        Long resumeId = resumeService.createResume(CANDIDATE,
                new ResumeRequest("Platform CV", null, null, null)).id();

        workExperienceService.createWorkExperience(resumeId, CANDIDATE,
                new WorkExperienceRequest("Acme Corp", null, "Backend Lead", null,
                        null, "Berlin", null, "Germany", null,
                        LocalDate.of(2020, 3, 1), null, true,
                        "Leading the platform team", java.util.List.of("Kotlin", "Kafka"), 0));
        educationService.addEducation(resumeId, CANDIDATE,
                new EducationRequest("TU Hamburg", "B.Sc. Computer Science", "Software Systems",
                        "1.3", LocalDate.of(2014, 10, 1), null, true, null, 0));
        resumeSkillService.addSkill(resumeId, CANDIDATE,
                new ResumeSkillRequest("Spring Boot", ProficiencyLevel.ADVANCED, 6, 0));
        languageService.addLanguage(resumeId, CANDIDATE,
                new LanguageProficiencyRequest("English", LanguageProficiency.FLUENT, 1));
        awardService.addAward(resumeId, CANDIDATE,
                new AwardRequest("Hackathon winner", "DemoDay", LocalDate.of(2023, 6, 10),
                        "First place out of 40 teams", 0));

        // a foreign candidate may neither read nor mutate this resume
        assertThatThrownBy(() -> workExperienceService.getAllWorkExperiences(resumeId, OTHER_CANDIDATE))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("resume owner");
        assertThatThrownBy(() -> resumeService.getResumeById(resumeId, OTHER_CANDIDATE))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("resume owner");

        ResumeResponse detail = resumeService.getResumeById(resumeId, CANDIDATE);
        // work + education + skill + language + award = 5 of the 10 checklist parts
        assertThat(detail.completionScore()).isEqualTo(50);

        // personal name + email add two more checklist parts
        detail = resumeService.updatePersonalInfo(resumeId, CANDIDATE,
                new PersonalInfoRequest("Mia", "Keller", null, "mia@example.com",
                        null, null, null, null, null, null, null));
        assertThat(detail.completionScore()).isEqualTo(70);
        assertThat(detail.workExperiences()).hasSize(1);
        assertThat(detail.educations().get(0).isCurrentlyStudying()).isTrue();
        assertThat(detail.educations().get(0).endDate()).isNull();
        assertThat(detail.skills().get(0).proficiencyLevel()).isEqualTo(ProficiencyLevel.ADVANCED);
        assertThat(detail.languages().get(0).language()).isEqualTo("English");
        assertThat(detail.awards().get(0).title()).isEqualTo("Hackathon winner");
        assertThat(detail.projects()).isEmpty();
        assertThat(detail.certifications()).isEmpty();
    }

    @Test
    void updatingSectionsWithTechnologiesSucceeds() {
        Long resumeId = resumeService.createResume(CANDIDATE,
                new ResumeRequest("Core CV", null, null, null)).id();

        // regresses the merge-time UnsupportedOperationException when an
        // immutable technologies list was set on an already-managed entity
        var experience = workExperienceService.createWorkExperience(resumeId, CANDIDATE,
                new WorkExperienceRequest("Nimbus Software", null, "Backend Lead", null,
                        null, "Berlin", null, "Germany", null,
                        LocalDate.of(2020, 3, 1), null, true, null,
                        java.util.List.of("Kotlin", "Kafka"), 0));
        var updatedExperience = workExperienceService.updateWorkExperience(
                experience.id(), resumeId, CANDIDATE,
                new WorkExperienceRequest("Nimbus Software", null, "Principal Engineer", null,
                        null, "Berlin", null, "Germany", null,
                        LocalDate.of(2020, 3, 1), null, true, null,
                        java.util.List.of("Java", "Spring Boot"), 0));
        assertThat(updatedExperience.position()).isEqualTo("Principal Engineer");
        assertThat(updatedExperience.technologies()).containsExactly("Java", "Spring Boot");

        var project = projectService.addProject(resumeId, CANDIDATE,
                new ProjectRequest("Job Tracker", null, java.util.List.of("Kotlin"),
                        "https://example.com/tracker", null,
                        LocalDate.of(2024, 1, 1), null, 0));
        var updatedProject = projectService.updateProject(project.id(), resumeId, CANDIDATE,
                new ProjectRequest("Job Tracker", "Morning rebuild", java.util.List.of("Java", "PostgreSQL"),
                        "https://example.com/tracker", null,
                        LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31), 0));
        assertThat(updatedProject.technologies()).containsExactly("Java", "PostgreSQL");
        assertThat(updatedProject.isOngoing()).isFalse();
    }

    @Test
    void workExperienceRequiresEndDateWhenNotCurrent() {
        Long resumeId = resumeService.createResume(CANDIDATE,
                new ResumeRequest("Interim CV", null, null, null)).id();

        assertThatThrownBy(() -> workExperienceService.createWorkExperience(resumeId, CANDIDATE,
                new WorkExperienceRequest("Past Corp", null, "Developer", null,
                        null, null, null, null, null,
                        LocalDate.of(2019, 1, 1), null, false, null, null, 0)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("endDate is required");

        assertThatThrownBy(() -> workExperienceService.createWorkExperience(resumeId, CANDIDATE,
                new WorkExperienceRequest("Bars Corp", null, "Developer", null,
                        null, null, null, null, null,
                        LocalDate.of(2021, 6, 1), LocalDate.of(2019, 1, 1), false, null, null, 0)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("endDate cannot be before startDate");
    }

    @Test
    void deletingTheDefaultResumePromotesTheNewestRemaining() {
        Long first = resumeService.createResume(CANDIDATE,
                new ResumeRequest("First CV", null, null, null)).id();
        Long second = resumeService.createResume(CANDIDATE,
                new ResumeRequest("Second CV", null, null, null)).id();

        resumeService.setDefaultResume(second, CANDIDATE);
        resumeService.deleteResume(second, CANDIDATE);

        // deleting a resume leaves it 404 for every further call
        assertThatThrownBy(() -> resumeService.getResumeById(second, CANDIDATE))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not found");

        var remaining = resumeService.getMyResumes(CANDIDATE);
        assertThat(remaining).hasSize(1);
        assertThat(remaining.get(0).id()).isEqualTo(first);
        assertThat(remaining.get(0).isDefault()).isTrue();
    }

    @Test
    void unauthenticatedCallsAreRejected() {
        assertThatThrownBy(() -> resumeService.createResume(null,
                new ResumeRequest("Anon CV", null, null, null)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Authentication is required");
        assertThatThrownBy(() -> resumeService.getMyResumes(null))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Authentication is required");
    }
}
