package com.sho1kat.service;

import com.sho1kat.event.ApplicationStatusUpdateEvent;

public interface MailService {

    void sendMail(String to, String subject, String body);
    void sendStatusChangeMail(ApplicationStatusUpdateEvent event);
    void sendShortListedMail(ApplicationStatusUpdateEvent event);
    void sendRejectionMail(ApplicationStatusUpdateEvent event);
    void sendHiringMail(ApplicationStatusUpdateEvent event);
}