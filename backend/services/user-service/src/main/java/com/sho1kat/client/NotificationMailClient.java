package com.sho1kat.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "notification-service")
public interface NotificationMailClient {

    @PostMapping("/api/notifications/mail/send")
    void sendMail(@RequestParam("to") String to,
                  @RequestParam("subject") String subject,
                  @RequestBody String body);
}
