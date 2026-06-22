package com.pulse.survey.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.pulse.survey.util.AllowedDomainValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleTokenVerifierService {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.allowed-domain}")
    private String allowedDomain;

    private final AllowedDomainValidator domainValidator;

    public GoogleIdToken.Payload verify(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new IllegalArgumentException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();

            if (email == null || email.isBlank()) {
                throw new SecurityException("Google account email is required");
            }

            domainValidator.validateEmail(email);

            String hostedDomain = (String) payload.get("hd");
            if (hostedDomain != null && !hostedDomain.equalsIgnoreCase(allowedDomain)) {
                throw new SecurityException("Access restricted to " + allowedDomain + " accounts only");
            }

            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new SecurityException("Google account email must be verified");
            }

            return payload;
        } catch (SecurityException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            throw new IllegalArgumentException("Google token verification failed: " + e.getMessage());
        }
    }
}
