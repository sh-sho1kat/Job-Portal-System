package com.sho1kat.event;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApplicationEventPublisher {
    public static final String TOPIC = "application.status.change";

    private final KafkaTemplate<String, String> kafkaTemplate;

}
