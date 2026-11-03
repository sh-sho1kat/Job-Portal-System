
package com.sho1kat.event;

import com.sho1kat.client.CompanyClient;
import com.sho1kat.client.JobClient;
import com.sho1kat.client.UserClient;
import com.sho1kat.dto.jobServiceDto.response.CompanySummaryResponse;
import com.sho1kat.dto.jobServiceDto.response.JobSummaryResponse;
import com.sho1kat.dto.user_service.response.UserResponse;
import com.sho1kat.entity.Application;
import com.sho1kat.enums.ApplicationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class ApplicationEventPublisher {

    public static final String TOPIC = "application.status.change";

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserClient userClient;
    private final CompanyClient companyClient;
    private final JobClient jobClient;

    public void publishApplicationStatusUpdateEvent(
            Application application,
            ApplicationStatus oldStatus,
            ApplicationStatus newStatus
    ) {
        // Enable when interservice authentication is configured.
        // UserResponse candidate = userClient.getUserById(application.getCandidateId());

        CompanySummaryResponse company =
                companyClient.getCompanyById(application.getCompanyId());

        JobSummaryResponse job =
                jobClient.getJobById(application.getJobId());

        ApplicationStatusUpdateEvent event = new ApplicationStatusUpdateEvent(
                oldStatus,
                newStatus,
                "Demo",
                "Demo",
                "Demo",
                "example.kafka@email.com",
                job.title(),
                company.name()
        );

        log.info("Publishing application status update event: {}", event);

        // Send the actual object. Kafka JsonSerializer converts it to JSON.
        kafkaTemplate.send(TOPIC, event);
    }
}
