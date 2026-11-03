package com.sho1kat.event;

import com.sho1kat.client.CompanyClient;
import com.sho1kat.client.JobClient;
import com.sho1kat.client.UserClient;
import com.sho1kat.dto.companyServiceDto.response.CompanyResponse;
import com.sho1kat.dto.jobServiceDto.response.CompanySummaryResponse;
import com.sho1kat.dto.jobServiceDto.response.JobResponse;
import com.sho1kat.dto.jobServiceDto.response.JobSummaryResponse;
import com.sho1kat.dto.user_service.response.UserResponse;
import com.sho1kat.entity.Application;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApplicationEventPublisher {
    public static final String TOPIC = "application.status.change";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final UserClient userClient;
    private final CompanyClient companyClient;
    private final JobClient jobClient;

    public void publishApplicationStatusUpdateEvent(Application application, String oldStatus, String newStatus) {
//        UserResponse candidate = userClient.getUserById(application.getCandidateId());
        UserResponse candidate = null;
        CompanySummaryResponse company = companyClient.getCompanyById(application.getCompanyId());
        JobSummaryResponse job = jobClient.getJobById(application.getJobId());

        ApplicationStatusUpdateEvent event = new ApplicationStatusUpdateEvent(
                oldStatus,
                newStatus,
//                candidate.firstName(),
//                candidate.middleName(),
//                candidate.lastName(),
//                candidate.email(),
                "Demo",
                "Demo",
                "Demo",
                "example.kafka@email.com",
                job.title(),
                company.name()
        );
        kafkaTemplate.send(TOPIC, event.toString());
    }
}
