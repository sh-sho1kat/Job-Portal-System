package com.sho1kat;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationNoteRequest;
import com.sho1kat.dto.applicationServiceDto.request.ApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.request.CompanyApplicationFilterRequest;
import com.sho1kat.dto.applicationServiceDto.request.WithdrawApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationResponse;
import com.sho1kat.entity.Application;
import com.sho1kat.enums.AiShortListStatus;
import com.sho1kat.enums.ApplicationStatus;
import com.sho1kat.exception.ApiException;
import com.sho1kat.repository.ApplicationNoteRepository;
import com.sho1kat.repository.ApplicationRepository;
import com.sho1kat.service.ApplicationNoteService;
import com.sho1kat.service.ApplicationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * H2-backed lifecycle checks for the application flows (same approach as the
 * sibling services: no external database needed for the test build).
 */
@SpringBootTest
class ApplicationServiceLifecycleTest {

    private static final long CANDIDATE = 4101L;
    private static final long OTHER_CANDIDATE = 4102L;
    private static final long COMPANY = 8801L;
    private static final long OTHER_COMPANY = 8802L;
    private static final long JOB = 9901L;
    private static final long RESUME = 2201L;
    private static final long EMPLOYER = 5101L;

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ApplicationNoteService applicationNoteService;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ApplicationNoteRepository applicationNoteRepository;

    @AfterEach
    void cleanUp() {
        applicationNoteRepository.deleteAll();
        applicationRepository.deleteAll();
    }

    private static ApplicationRequest applyRequest(long job, long company, long resume) {
        return new ApplicationRequest(job, company, resume, "Encouraged to join",
                new BigDecimal("45000"), LocalDate.now().plusMonths(1));
    }

    private static void withStatus(Runnable call, int expectedStatus) {
        assertThatThrownBy(call::run)
                .isInstanceOfSatisfying(ApiException.class,
                        ex -> assertThat(ex.getStatus()).isEqualTo(expectedStatus));
    }

    @Test
    void candidateCanApplyGetWithdrawAndReapply() {
        ApplicationResponse created = applicationService.createApplication(
                CANDIDATE, applyRequest(JOB, COMPANY, RESUME));

        // fresh application is PENDING with the ids denormalised, no screening yet
        assertThat(created.status()).isEqualTo(ApplicationStatus.PENDING);
        assertThat(created.candidate().id()).isEqualTo(CANDIDATE);
        assertThat(created.company().id()).isEqualTo(COMPANY);
        assertThat(created.job().id()).isEqualTo(JOB);
        assertThat(created.resumeId()).isEqualTo(RESUME);
        assertThat(created.screening()).isEqualTo(new com.sho1kat.dto.applicationServiceDto.response.ApplicationScreeningResponse(
                AiShortListStatus.NOT_SCREENED, null));
        assertThat(created.withdrawal()).isNull();
        assertThat(created.notes()).isEmpty();
        assertThat(created.appliedAt()).isNotNull();

        // duplicate guard: one live application per candidate and job
        withStatus(() -> applicationService.createApplication(
                CANDIDATE, applyRequest(JOB, COMPANY, RESUME)), ApiException.CONFLICT);

        // ownership: other candidates answer 404
        withStatus(() -> applicationService.getCandidateApplication(created.id(), OTHER_CANDIDATE),
                ApiException.NOT_FOUND);
        // the owner still gets the raw data back (internal notes withheld)
        assertThat(applicationService.getCandidateApplication(created.id(), CANDIDATE).notes())
                .isEmpty();

        // withdrawal with an optional reason
        ApplicationResponse withdrawn = applicationService.withdrawApplication(
                created.id(), CANDIDATE, new WithdrawApplicationRequest("Accepted another offer"));
        assertThat(withdrawn.status()).isEqualTo(ApplicationStatus.WITHDRAWN);
        assertThat(withdrawn.withdrawal().withdrawnReason()).isEqualTo("Accepted another offer");
        assertThat(withdrawn.withdrawal().withdrawnAt()).isNotNull();

        // second withdrawal answers 409; nobody else may withdraw
        withStatus(() -> applicationService.withdrawApplication(
                created.id(), CANDIDATE, new WithdrawApplicationRequest("changed my mind")),
                ApiException.CONFLICT);

        // re-applying after a withdrawal creates a fresh PENDING application
        ApplicationResponse reapplied = applicationService.createApplication(
                CANDIDATE, applyRequest(JOB, COMPANY, RESUME));
        assertThat(reapplied.id()).isNotEqualTo(created.id());
        assertThat(reapplied.status()).isEqualTo(ApplicationStatus.PENDING);
    }

    @Test
    void companyInboxScopesFiltersSortsAndTransitions() {
        ApplicationResponse first = applicationService.createApplication(
                CANDIDATE, applyRequest(JOB, COMPANY, RESUME));
        ApplicationResponse second = applicationService.createApplication(
                OTHER_CANDIDATE, applyRequest(JOB, COMPANY, RESUME));

        CompanyApplicationFilterRequest emptyCriteria =
                new CompanyApplicationFilterRequest(null, null, null, null, null, null);
        assertThat(applicationService.getCompanyApplications(COMPANY, emptyCriteria, 0, 50).getTotalElements())
                .isEqualTo(2);
        withStatus(() -> applicationService.getCompanyApplication(OTHER_COMPANY, first.id()),
                ApiException.NOT_FOUND);

        // star toggle selectability in the filter
        applicationService.setStar(COMPANY, first.id(), true);
        List<ApplicationResponse> starred = applicationService
                .getCompanyApplications(COMPANY,
                        new CompanyApplicationFilterRequest(null, null, true, null, null, null), 0, 50)
                .getContent();
        assertThat(starred).extracting(ApplicationResponse::id).containsExactly(first.id());
        assertThat(starred.getFirst().isStarred()).isTrue();
        applicationService.setStar(COMPANY, first.id(), false);
        assertThat(applicationService
                .getCompanyApplications(COMPANY,
                        new CompanyApplicationFilterRequest(null, null, true, null, null, null), 0, 50))
                .isEmpty();

        // status ladder REVIEWING -> SHORTLISTED -> HIRED
        ApplicationResponse reviewing = applicationService.updateStatus(COMPANY, second.id(), ApplicationStatus.REVIEWING);
        assertThat(reviewing.status()).isEqualTo(ApplicationStatus.REVIEWING);
        applicationService.updateStatus(COMPANY, second.id(), ApplicationStatus.SHORTLISTED);
        ApplicationResponse hired = applicationService.updateStatus(COMPANY, second.id(), ApplicationStatus.HIRED);
        assertThat(hired.status()).isEqualTo(ApplicationStatus.HIRED);

        // terminal, skip, no-op and candidate-only moves are rejected
        withStatus(() -> applicationService.updateStatus(COMPANY, second.id(), ApplicationStatus.REJECTED),
                ApiException.CONFLICT);
        withStatus(() -> applicationService.updateStatus(COMPANY, second.id(), ApplicationStatus.WITHDRAWN),
                ApiException.BAD_REQUEST);
        withStatus(() -> applicationService.updateStatus(COMPANY, second.id(), ApplicationStatus.HIRED),
                ApiException.BAD_REQUEST);
        withStatus(() -> applicationService.withdrawApplication(second.id(), OTHER_CANDIDATE, null),
                ApiException.CONFLICT);

        // the company detail view embeds the notes (none exist yet)
        assertThat(applicationService.getCompanyApplication(COMPANY, first.id()).notes())
                .isEmpty();

        // aiScore sort: scored first (developed manually; screening lives elsewhere)
        Application scored = applicationRepository.findById(second.id()).orElseThrow();
        scored.setAiScore(92);
        applicationRepository.save(scored);
        List<ApplicationResponse> byAiScore = applicationService
                .getCompanyApplications(COMPANY,
                        new CompanyApplicationFilterRequest(null, null, null, null, null, "aiScore"), 0, 50)
                .getContent();
        assertThat(byAiScore).extracting(ApplicationResponse::id).containsExactly(second.id(), first.id());
        assertThat(byAiScore.getFirst().screening().aiScore()).isEqualTo(92);

        // score filter drops the unscreened row
        List<ApplicationResponse> highScoreOnly = applicationService
                .getCompanyApplications(COMPANY,
                        new CompanyApplicationFilterRequest(null, null, null, null, 80, null), 0, 50)
                .getContent();
        assertThat(highScoreOnly).extracting(ApplicationResponse::id).containsExactly(second.id());

        // bad sort key and out-of-range score answer 400
        withStatus(() -> applicationService.getCompanyApplications(COMPANY,
                new CompanyApplicationFilterRequest(null, null, null, null, null, "bogus"), 0, 20),
                ApiException.BAD_REQUEST);
        withStatus(() -> applicationService.getCompanyApplications(COMPANY,
                new CompanyApplicationFilterRequest(null, null, null, null, 150, null), 0, 20),
                ApiException.BAD_REQUEST);
    }

    @Test
    void notesAreProvenanceTaggedAndAuthorGuarded() {
        Long applicationId = applicationService
                .createApplication(CANDIDATE, applyRequest(JOB, COMPANY, RESUME))
                .id();

        ApplicationNoteResponse note = applicationNoteService.addNote(
                applicationId, EMPLOYER, new ApplicationNoteRequest("Strong Java match"));
        assertThat(note.content()).isEqualTo("Strong Java match");
        assertThat(note.addedByUserId()).isEqualTo(EMPLOYER);
        assertThat(note.createdAt()).isNotNull();

        assertThat(applicationNoteService.getNotesByApplication(applicationId, EMPLOYER))
                .extracting(ApplicationNoteResponse::id)
                .containsExactly(note.id());

        // reads work for anyone but the note row stays author-held for deletion
        assertThat(applicationNoteService.getNote(applicationId, note.id(), EMPLOYER).id())
                .isEqualTo(note.id());
        withStatus(() -> applicationNoteService.deleteNote(applicationId, note.id(), 9999L),
                ApiException.FORBIDDEN);

        applicationNoteService.deleteNote(applicationId, note.id(), EMPLOYER);
        assertThat(applicationNoteService.getNotesByApplication(applicationId, EMPLOYER)).isEmpty();

        withStatus(() -> applicationNoteService.getNote(applicationId, note.id(), EMPLOYER),
                ApiException.NOT_FOUND);
        withStatus(() -> applicationNoteService.addNote(999_999L, EMPLOYER, new ApplicationNoteRequest("x")),
                ApiException.NOT_FOUND);
    }
}
