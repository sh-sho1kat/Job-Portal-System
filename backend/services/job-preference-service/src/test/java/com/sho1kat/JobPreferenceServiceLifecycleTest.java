package com.sho1kat;

import com.sho1kat.dto.jobPreferenceDto.request.SavedJobRequest;
import com.sho1kat.dto.jobPreferenceDto.response.SavedJobResponse;
import com.sho1kat.exception.ApiException;
import com.sho1kat.repository.SavedJobRepository;
import com.sho1kat.client.SavedJobService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * H2-backed lifecycle checks for the saved-job flows (same approach as the
 * sibling services: no external database needed for the test build).
 */
@SpringBootTest
class JobPreferenceServiceLifecycleTest {

    private static final long CANDIDATE = 6101L;
    private static final long OTHER_CANDIDATE = 6102L;
    private static final long JOB = 9901L;
    private static final long OTHER_JOB = 9902L;
    private static final long COMPANY = 8801L;
    private static final long OTHER_COMPANY = 8802L;

    @Autowired
    private SavedJobService savedJobService;

    @Autowired
    private SavedJobRepository savedJobRepository;

    @AfterEach
    void cleanUp() {
        savedJobRepository.deleteAll();
    }

    private static SavedJobRequest saveRequest(long job, long company) {
        return new SavedJobRequest(job, company, "  Interesting pay  ");
    }

    private static void withStatus(Runnable call, int expectedStatus) {
        assertThatThrownBy(call::run)
                .isInstanceOfSatisfying(ApiException.class,
                        ex -> assertThat(ex.getStatus()).isEqualTo(expectedStatus));
    }

    @Test
    void candidateCanSaveListProbeAndUnsave() {
        SavedJobResponse created = savedJobService.saveJob(CANDIDATE, saveRequest(JOB, COMPANY));

        // the save copies the ids and normalizes the note; timestamp is stamped
        assertThat(created.candidateId()).isEqualTo(CANDIDATE);
        assertThat(created.jobId()).isEqualTo(JOB);
        assertThat(created.companyId()).isEqualTo(COMPANY);
        assertThat(created.notes()).isEqualTo("Interesting pay");
        assertThat(created.savedAt()).isNotNull();

        // duplicate guard: one bookmark per candidate and job
        withStatus(() -> savedJobService.saveJob(CANDIDATE, saveRequest(JOB, COMPANY)),
                ApiException.CONFLICT);
        // the same job may be saved by a different candidate
        savedJobService.saveJob(OTHER_CANDIDATE, saveRequest(JOB, COMPANY));
        assertThat(savedJobService.isSaved(OTHER_CANDIDATE, JOB)).isTrue();

        // probe endpoint drives the job-list checkbox
        assertThat(savedJobService.isSaved(CANDIDATE, JOB)).isTrue();
        assertThat(savedJobService.isSaved(CANDIDATE, OTHER_JOB)).isFalse();

        // list is owner-scoped and newest first; a saved row may carry no note
        savedJobService.saveJob(CANDIDATE, new SavedJobRequest(OTHER_JOB, OTHER_COMPANY, null));
        List<SavedJobResponse> saved = savedJobService.getSavedJobs(CANDIDATE);
        assertThat(saved).extracting(SavedJobResponse::jobId).containsExactly(OTHER_JOB, JOB);
        assertThat(saved.getFirst().notes()).isNull();
        assertThat(savedJobService.getSavedJobs(OTHER_CANDIDATE))
                .extracting(SavedJobResponse::jobId)
                .containsExactly(JOB);

        // unsave is owner-scoped: other candidates answer 404
        withStatus(() -> savedJobService.unsaveJob(OTHER_CANDIDATE, created.id()),
                ApiException.NOT_FOUND);

        savedJobService.unsaveJob(CANDIDATE, created.id());
        withStatus(() -> savedJobService.unsaveJob(CANDIDATE, created.id()),
                ApiException.NOT_FOUND);
        assertThat(savedJobService.isSaved(CANDIDATE, JOB)).isFalse();
    }
}
