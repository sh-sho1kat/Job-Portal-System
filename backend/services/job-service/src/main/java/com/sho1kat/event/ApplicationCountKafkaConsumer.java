
package com.sho1kat.event;

import com.sho1kat.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationCountKafkaConsumer {

    private final JobService jobService;

    @KafkaListener(
            topics = "application-count-increase",
            groupId = "job-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeApplicationCountUpdateEvent(
            Long jobId
    ) {
        log.info("Received application count update event for jobId: {}",
                jobId
        );
        jobService.incrementApplicationCount(jobId);
    }
}
