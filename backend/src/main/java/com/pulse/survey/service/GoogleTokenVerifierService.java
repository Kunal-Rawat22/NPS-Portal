package com.pulse.survey.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.pulse.survey.exception.UnauthorizedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@Slf4j
public class GoogleTokenVerifierService {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.allowed-domain}")
    private String allowedDomain;

    public GoogleIdToken.Payload verify(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new UnauthorizedException("Invalid or expired Google token");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();

            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new SecurityException("Google account email is not verified");
            }

            if (!isAllowedDomain(payload)) {
                throw new SecurityException("Access restricted to " + allowedDomain + " accounts only");
            }

            return payload;
        } catch (SecurityException | UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            throw new UnauthorizedException("Invalid or expired Google token");
        }
    }

    private boolean isAllowedDomain(GoogleIdToken.Payload payload) {
        String hostedDomain = (String) payload.get("hd");
        if (hostedDomain != null && hostedDomain.equalsIgnoreCase(allowedDomain)) {
            return true;
        }

        String email = payload.getEmail();
        if (email != null) {
            String suffix = "@" + allowedDomain.toLowerCase();
            return email.toLowerCase().endsWith(suffix);
        }

        return false;
    }
}
