package com.pulse.survey.util;

import com.pulse.survey.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AllowedDomainValidator {

    @Value("${google.allowed-domain}")
    private String allowedDomain;

    public void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        String normalized = email.trim().toLowerCase();
        String suffix = "@" + allowedDomain.toLowerCase();
        if (!normalized.endsWith(suffix)) {
            throw new BadRequestException("Only @" + allowedDomain + " email addresses are allowed");
        }
    }

    public String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
