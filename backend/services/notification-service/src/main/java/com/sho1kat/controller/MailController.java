package com.sho1kat.controller;

import com.sho1kat.dto.MessageResponse;
import com.sho1kat.event.ApplicationStatusUpdateEvent;
import com.sho1kat.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    @PostMapping("/send")
    public ResponseEntity<MessageResponse> sendMail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestBody String body
    ) {
        mailService.sendMail(to, subject, body);
        return ResponseEntity.ok(new MessageResponse("Mail sent successfully"));
    }

    @PostMapping("/status")
    public ResponseEntity<MessageResponse> sendStatusChangeMail(
            @RequestBody ApplicationStatusUpdateEvent event
    ) {
        mailService.sendStatusChangeMail(event);
        return ResponseEntity.ok(new MessageResponse("Status update email sent"));
    }

    @PostMapping("/shortlisted")
    public ResponseEntity<MessageResponse> sendShortListedMail(
            @RequestBody ApplicationStatusUpdateEvent event
    ) {
        mailService.sendShortListedMail(event);
        return ResponseEntity.ok(new MessageResponse("Shortlisted email sent"));
    }

    @PostMapping("/rejection")
    public ResponseEntity<MessageResponse> sendRejectionMail(
            @RequestBody ApplicationStatusUpdateEvent event
    ) {
        mailService.sendRejectionMail(event);
        return ResponseEntity.ok(new MessageResponse("Rejection email sent"));
    }

    @PostMapping("/hiring")
    public ResponseEntity<MessageResponse> sendHiringMail(
            @RequestBody ApplicationStatusUpdateEvent event
    ) {
        mailService.sendHiringMail(event);
        return ResponseEntity.ok(new MessageResponse("Hiring email sent"));
    }

    // todo: add HTML email templates for all the above methods and use them in the mail service
}