package com.pulse.survey.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.pulse.survey.dto.request.EmailLoginRequest;
import com.pulse.survey.dto.request.GoogleAuthRequest;
import com.pulse.survey.dto.request.RefreshTokenRequest;
import com.pulse.survey.dto.response.AuthTokenResponse;
import com.pulse.survey.dto.response.UserDto;
import com.pulse.survey.entity.User;
import com.pulse.survey.exception.ForbiddenException;
import com.pulse.survey.exception.ResourceNotFoundException;
import com.pulse.survey.repository.UserRepository;
import com.pulse.survey.util.AllowedDomainValidator;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final GoogleTokenVerifierService googleVerifier;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AllowedDomainValidator domainValidator;

    @Transactional
    public AuthTokenResponse googleLogin(GoogleAuthRequest request) {
        GoogleIdToken.Payload payload = googleVerifier.verify(request.idToken());

        String email = domainValidator.normalizeEmail(payload.getEmail());
        String googleSub = payload.getSubject();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException(
                        "Account not found. Please ask your administrator to provision your account before logging in."));

        if (!user.isActive()) {
            throw new ForbiddenException("Your account is deactivated. Please contact HR.");
        }

        user.setGoogleSub(googleSub);
        if (picture != null) user.setAvatarUrl(picture);
        if (name != null && user.getFirstName() == null) {
            String[] parts = name.split(" ", 2);
            user.setFirstName(parts[0]);
            if (parts.length > 1) user.setLastName(parts[1]);
        }
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        jwtService.storeRefreshToken(user.getId(), refreshToken);

        log.info("User {} logged in via Google SSO with role {}", email, user.getRole());
        return new AuthTokenResponse(accessToken, refreshToken, UserDto.from(user));
    }

    public AuthTokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new ForbiddenException("Refresh token is invalid or expired");
        }

        Claims claims = jwtService.extractAllClaims(refreshToken);
        if (!"refresh".equals(claims.get("type"))) {
            throw new ForbiddenException("Token is not a refresh token");
        }

        UUID userId = UUID.fromString(claims.getSubject());
        if (!jwtService.isRefreshTokenValid(userId, refreshToken)) {
            throw new ForbiddenException("Refresh token has been invalidated");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtService.generateRefreshToken(user.getId());
        jwtService.storeRefreshToken(user.getId(), newRefreshToken);

        return new AuthTokenResponse(newAccessToken, newRefreshToken, UserDto.from(user));
    }

    public AuthTokenResponse emailLogin(EmailLoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ForbiddenException("Invalid email or password"));

        if (!user.isActive()) {
            throw new ForbiddenException("Your account is deactivated. Please contact HR.");
        }

        if (user.getPasswordHash() == null) {
            throw new ForbiddenException("This account uses Google Sign-In. Please use the 'Sign in with Google' button.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ForbiddenException("Invalid email or password");
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        jwtService.storeRefreshToken(user.getId(), refreshToken);

        log.info("User {} logged in via email/password with role {}", user.getEmail(), user.getRole());
        return new AuthTokenResponse(accessToken, refreshToken, UserDto.from(user));
    }

    public void logout(UUID userId) {
        jwtService.invalidateRefreshToken(userId);
        log.info("User {} logged out", userId);
    }
}
