package com.pulse.survey.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthService {

    private static final String AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";

    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    @Value("${google.allowed-domain}")
    private String allowedDomain;

    public String buildAuthorizationUrl() {
        String scope = URLEncoder.encode("openid email profile", StandardCharsets.UTF_8);
        String redirect = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
        String hd = URLEncoder.encode(allowedDomain, StandardCharsets.UTF_8);

        return AUTH_URL
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirect
                + "&response_type=code"
                + "&scope=" + scope
                + "&hd=" + hd
                + "&access_type=offline"
                + "&prompt=select_account";
    }

    public String exchangeCodeForIdToken(String code) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");

        try {
            String response = restClient.post()
                    .uri(TOKEN_URL)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode json = objectMapper.readTree(response);
            if (json.has("error")) {
                String description = json.path("error_description").asText(json.path("error").asText());
                throw new IllegalArgumentException("Google token exchange failed: " + description);
            }

            String idToken = json.path("id_token").asText(null);
            if (idToken == null || idToken.isBlank()) {
                throw new IllegalArgumentException("Google did not return an ID token");
            }
            return idToken;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google token exchange failed: {}", e.getMessage());
            throw new IllegalArgumentException("Google token exchange failed: " + e.getMessage());
        }
    }
}
