package com.pulse.survey.controller;

import com.pulse.survey.dto.request.EmailLoginRequest;
import com.pulse.survey.dto.request.GoogleAuthRequest;
import com.pulse.survey.dto.request.RefreshTokenRequest;
import com.pulse.survey.dto.response.AuthTokenResponse;
import com.pulse.survey.security.UserPrincipal;
import com.pulse.survey.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthTokenResponse> emailLogin(@Valid @RequestBody EmailLoginRequest request) {
        return ResponseEntity.ok(authService.emailLogin(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthTokenResponse> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.googleLogin(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserPrincipal principal) {
        authService.logout(principal.getId());
        return ResponseEntity.ok().build();
    }
}
