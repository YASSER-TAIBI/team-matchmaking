package com.yazzer.foot5connect.services.email;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendEmail(String to, String token) {
        try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom("yasser.taibi.19@gmail.com");
        message.setSubject("Confirm your account");
        String messageBody = """
                        

            Thank you for registering on Foot5Connect!
            

            Please click on the link below to confirm your email address:
            

            http://localhost:8080/auth/confirmToken?token=%s
            

            """.formatted(token);
        message.setText(messageBody);
        mailSender.send(message);
            
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
