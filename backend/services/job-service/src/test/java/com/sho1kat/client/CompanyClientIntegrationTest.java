package com.sho1kat.client;

import com.sho1kat.dto.jobServiceDto.response.CompanySummaryResponse;
import com.sho1kat.dto.jobServiceDto.response.JobResponse;
import com.sho1kat.entity.Job;
import com.sho1kat.entity.JobCategory;
import com.sho1kat.enums.EmploymentType;
import com.sho1kat.enums.ExperienceLevel;
import com.sho1kat.enums.WorkMode;
import com.sho1kat.mapper.JobMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Company enrichment over service discovery: the test profile runs without
 * eureka/company-service, so lookups fail and the mapper must degrade to the
 * id-only summary instead of failing job requests (the graceful path documented
 * on {@link CompanySummaryResponse}).
 */
@SpringBootTest
class CompanyClientIntegrationTest {

    @Autowired
    private CompanyClient companyClient;

    @Autowired
    private JobMapper jobMapper;

    @Test
    void unreachableCompanyServiceAnswersIdOnlySummary() {
        CompanySummaryResponse summary = companyClient.getCompanyById(42L);

        assertEquals(42L, summary.id());
        assertNull(summary.name());
        assertNull(summary.slug());
        assertNull(summary.logoUrl());
        assertNull(summary.industryType());
    }

    @Test
    void jobCardsEmbedIdOnlyCompanyWhenCompanyServiceIsUnreachable() {
        Job job = Job.builder()
                .companyId(101L)
                .title("Backend Engineer")
                .employmentType(EmploymentType.FULL_TIME)
                .experienceLevel(ExperienceLevel.MID_LEVEL)
                .workMode(WorkMode.ON_SITE)
                .category(JobCategory.builder().id(5L).build())
                .build();

        JobResponse card = jobMapper.toResponse(job);

        assertEquals(101L, card.company().id());
        assertNull(card.company().name());
    }
}
