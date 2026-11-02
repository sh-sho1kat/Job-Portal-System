package com.sho1kat.service;

import com.sho1kat.dto.notificationServiceDto.request.HiringRequest;
import com.sho1kat.dto.notificationServiceDto.request.RejectionRequest;
import com.sho1kat.dto.notificationServiceDto.request.ShortListedRequest;

public interface MailService {

    void sendMail(String to, String subject, String body);
    void sendStatusChangeMail(String to, String Status);
    void sendShortListedMail(String to, ShortListedRequest request);
    void sendRejectionMail(String to, RejectionRequest request);
    void sendHiringMail(String to, HiringRequest request);
}