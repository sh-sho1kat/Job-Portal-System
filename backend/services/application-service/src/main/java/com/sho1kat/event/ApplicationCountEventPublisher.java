package com.sho1kat.event;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationCountEventPublisher {

    public static final String APPLICATION_COUNT_INCREASE_EVENT = "application-count-increase";
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishApplicationCountIncreaseEvent(Long jobId) {
        log.info("Publishing application count increase event for jobId: {}", jobId);
        kafkaTemplate.send(APPLICATION_COUNT_INCREASE_EVENT, jobId);
    }
}
