package com.sho1kat.controller;

import com.sho1kat.dto.MessageResponse;
import com.sho1kat.dto.notificationServiceDto.request.HiringRequest;
import com.sho1kat.dto.notificationServiceDto.request.RejectionRequest;
import com.sho1kat.dto.notificationServiceDto.request.ShortListedRequest;
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
            @RequestParam String to,
            @RequestParam String status
    ) {
        mailService.sendStatusChangeMail(to, status);
        return ResponseEntity.ok(new MessageResponse("Status update email sent"));
    }

    @PostMapping("/shortlisted")
    public ResponseEntity<MessageResponse> sendShortListedMail(
            @RequestParam String to,
            @RequestBody ShortListedRequest request
    ) {
        mailService.sendShortListedMail(to, request);
        return ResponseEntity.ok(new MessageResponse("Shortlisted email sent"));
    }

    @PostMapping("/rejection")
    public ResponseEntity<MessageResponse> sendRejectionMail(
            @RequestParam String to,
            @RequestBody RejectionRequest request
    ) {
        mailService.sendRejectionMail(to, request);
        return ResponseEntity.ok(new MessageResponse("Rejection email sent"));
    }

    @PostMapping("/hiring")
    public ResponseEntity<MessageResponse> sendHiringMail(
            @RequestParam String to,
            @RequestBody HiringRequest request
    ) {
        mailService.sendHiringMail(to, request);
        return ResponseEntity.ok(new MessageResponse("Hiring email sent"));
    }

    // todo: add HTML email templates for all the above methods and use them in the mail service
}