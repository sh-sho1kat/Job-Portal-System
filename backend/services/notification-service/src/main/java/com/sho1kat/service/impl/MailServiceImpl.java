package com.sho1kat.service.impl;

import com.sho1kat.event.ApplicationStatusUpdateEvent;
import com.sho1kat.service.MailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String mailFrom;

    @Override
    public void sendMail(String to, String subject, String body) {
        sendPlainTextMail(to, subject, body);
    }

    @Override
    public void sendApplicationReceivedMail(ApplicationStatusUpdateEvent event) {
        String to = event.email();
        String CandidateName = fullName(event);
        String CompanyName = event.companyName();

        String body = """
                Dear %s,

                Thank you for your application.

                We have received your application for the position of %s at %s.

                Our recruitment team will review your application and get back to you soon.

                Best regards,
                HR, %s
                """.formatted(
                CandidateName,
                event.jobTitle(),
                CompanyName,
                CompanyName
        );
        String subject = "Application Received";
        sendPlainTextMail(
                to,
                subject,
                body
        );
    }

    @Override
    public void sendStatusChangeMail(ApplicationStatusUpdateEvent event) {
        String to = event.email();
        String oldStatus = event.oldStatus().toString();
        String newStatus = event.newStatus().toString();
        String CandidateName = fullName(event);
        String CompanyName = event.companyName();

        String body = """
                Dear %s,

                Your application status has been updated.

                Current Status: %s
                Previous Status: %s

                Best regards,
                HR, %s
                """.formatted(CandidateName, newStatus, oldStatus, CompanyName);
        String subject = "Application Status Updated";

        sendPlainTextMail(
                to,
                subject,
                body
        );
    }

    @Override
    public void sendShortListedMail(ApplicationStatusUpdateEvent event) {
        String to = event.email();
        String CandidateName = fullName(event);
        String CompanyName = event.companyName();

        String body = """
                Dear %s,

                Congratulations!

                We are pleased to inform you that your CV has been shortlisted for the position of %s at %s.

                Our recruitment team will contact you with the next steps of the hiring process.

                Best regards,
                HR, %s
                """.formatted(
                CandidateName,
                event.jobTitle(),
                CompanyName,
                CompanyName
        );
        String subject = "Congratulations! Your CV has been shortlisted";
        sendPlainTextMail(
                to,
                subject,
                body
        );
    }

    @Override
    public void sendRejectionMail(ApplicationStatusUpdateEvent event) {
        String to = event.email();
        String CandidateName = fullName(event);
        String CompanyName = event.companyName();

        String body = """
                Dear %s,

                Thank you for your interest in the position of %s at %s.

                After careful consideration, we regret to inform you that your application has not been selected to proceed further in the recruitment process.

                We appreciate your time and effort.

                We wish you all the best in your future career.

                Best regards,
                HR, %s
                """.formatted(
                CandidateName,
                event.jobTitle(),
                CompanyName,
                CompanyName
        );
        String subject = "Update Regarding Your Application";
        sendPlainTextMail(
                to,
                subject,
                body
        );
    }

    @Override
    public void sendHiringMail(ApplicationStatusUpdateEvent event) {
        String to = event.email();
        String CandidateName = fullName(event);
        String CompanyName = event.companyName();

        String body = """
                Dear %s,

                Congratulations!

                We are delighted to inform you that you have been selected for the position of %s at %s.

                Our team will contact you shortly with further details regarding your joining process.

                We are excited to have you join our team.

                Best regards,
                HR, %s
                """.formatted(
                getName(CandidateName),
                event.jobTitle(),
                CompanyName,
                CompanyName
        );
        String subject = "Congratulations! You Have Been Selected";
        sendPlainTextMail(
                to,
                subject,
                body
        );
    }

    private void sendPlainTextMail(String to, String subject, String body) {

        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException(
                    "Recipient email must not be empty"
            );
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    false,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to create email message", e);
        }
    }

    private String getName(String name) {
        return name == null || name.isBlank()
                ? "there"
                : name.trim();
    }

    private String fullName(ApplicationStatusUpdateEvent event) {
        String name = Stream.of(event.FirstName(), event.MiddleName(), event.LastName())
                .filter(part -> part != null && !part.isBlank())
                .collect(Collectors.joining(" "));
        return name.isBlank() ? "Candidate" : name;
    }
}