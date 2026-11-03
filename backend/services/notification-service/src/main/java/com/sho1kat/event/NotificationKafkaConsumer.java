
package com.sho1kat.event;

import com.sho1kat.enums.ApplicationStatus;
import com.sho1kat.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationKafkaConsumer {

    private final MailService mailService;

    @KafkaListener(
            topics = "application.status.change",
            groupId = "notification-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeApplicationStatusChangedEvent(
            ApplicationStatusUpdateEvent event
    ) {
        log.info(
                "Received application status event: {} -> {}",
                event.oldStatus(),
                event.newStatus()
        );

        switch (event.newStatus().name()) {

            case "SHORTLISTED" ->
                    mailService.sendShortListedMail(event);

            case "REJECTED" ->
                    mailService.sendRejectionMail(event);

            case "HIRED" ->
                    mailService.sendHiringMail(event);

            default ->
                    mailService.sendStatusChangeMail(event);
        }

        log.info(
                "Notification processing completed for status: {}",
                event.newStatus()
        );
    }
}
