package com.pulse.survey.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulse.survey.dto.request.GoogleAuthRequest;
import com.pulse.survey.dto.response.AuthTokenResponse;
import com.pulse.survey.service.AuthService;
import com.pulse.survey.service.GoogleOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
@RequestMapping("/login")
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthController {

    private final GoogleOAuthService googleOAuthService;
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @GetMapping("/auth/google")
    public void googleAuth(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error,
            HttpServletResponse response) throws IOException {

        if (error != null) {
            redirectToLogin(response, "Google sign-in was cancelled or denied.");
            return;
        }

        if (code == null || code.isBlank()) {
            response.sendRedirect(googleOAuthService.buildAuthorizationUrl());
            return;
        }

        try {
            String idToken = googleOAuthService.exchangeCodeForIdToken(code);
            AuthTokenResponse tokens = authService.googleLogin(new GoogleAuthRequest(idToken));
            response.sendRedirect(buildSuccessRedirect(tokens));
        } catch (Exception e) {
            log.error("Google OAuth callback failed: {}", e.getMessage());
            redirectToLogin(response, e.getMessage());
        }
    }

    private void redirectToLogin(HttpServletResponse response, String message) throws IOException {
        String encoded = URLEncoder.encode(message, StandardCharsets.UTF_8);
        response.sendRedirect(frontendUrl + "/login?error=" + encoded);
    }

    private String buildSuccessRedirect(AuthTokenResponse tokens) throws IOException {
        String userJson = URLEncoder.encode(objectMapper.writeValueAsString(tokens.user()), StandardCharsets.UTF_8);
        return frontendUrl
                + "/auth/google/callback"
                + "?accessToken=" + URLEncoder.encode(tokens.accessToken(), StandardCharsets.UTF_8)
                + "&refreshToken=" + URLEncoder.encode(tokens.refreshToken(), StandardCharsets.UTF_8)
                + "&user=" + userJson;
    }
}
