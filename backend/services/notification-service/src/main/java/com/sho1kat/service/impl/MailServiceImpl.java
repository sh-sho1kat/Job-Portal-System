package com.sho1kat.service.impl;

import com.sho1kat.dto.notificationServiceDto.request.HiringRequest;
import com.sho1kat.dto.notificationServiceDto.request.RejectionRequest;
import com.sho1kat.dto.notificationServiceDto.request.ShortListedRequest;
import com.sho1kat.service.MailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

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
    public void sendStatusChangeMail(String to, String status) {

        String body = """
                Hello,

                Your application status has been updated.

                Current Status: %s

                Thank you.
                """.formatted(status);
        String subject = "Application Status Updated";

        sendPlainTextMail(
                to,
                subject,
                body
        );
    }

    @Override
    public void sendShortListedMail(String to, ShortListedRequest request) {

        String body = """
                Dear %s,

                Congratulations!

                We are pleased to inform you that your CV has been shortlisted for the position of %s at %s.

                Our recruitment team will contact you with the next steps of the hiring process.

                Best regards,
                HR, %s
                """.formatted(
                getName(request.candidateName()),
                request.jobTitle(),
                request.companyName(),
                request.companyName()
        );
        String subject = "Congratulations! Your CV is shortlisted";
        sendPlainTextMail(
                to,
                subject,
                body
        );
    }

    @Override
    public void sendRejectionMail(String to, RejectionRequest request) {

        String body = """
                Dear %s,

                Thank you for your interest in the position of %s at %s.

                After careful consideration, we regret to inform you that your application has not been selected to proceed further in the recruitment process.

                We appreciate your time and effort.

                We wish you all the best in your future career.

                Best regards,
                %s
                """.formatted(
                getName(request.candidateName()),
                request.jobTitle(),
                request.companyName(),
                request.companyName()
        );
        String subject = "Update Regarding Your Application";
        sendPlainTextMail(
                to,
                subject,
                body
        );
    }

    @Override
    public void sendHiringMail(String to, HiringRequest request) {

        String body = """
                Dear %s,

                Congratulations!

                We are delighted to inform you that you have been selected for the position of %s at %s.

                Our team will contact you shortly with further details regarding your joining process.

                We are excited to have you join our team.

                Best regards,
                %s
                """.formatted(
                getName(request.candidateName()),
                request.jobTitle(),
                request.companyName(),
                request.companyName()
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
}