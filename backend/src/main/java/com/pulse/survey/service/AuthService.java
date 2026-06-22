package com.pulse.survey.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.pulse.survey.dto.request.EmailLoginRequest;
import com.pulse.survey.dto.request.GoogleAuthRequest;
import com.pulse.survey.dto.request.RefreshTokenRequest;
import com.pulse.survey.dto.response.AuthTokenResponse;
import com.pulse.survey.dto.response.UserDto;
import com.pulse.survey.entity.User;
import com.pulse.survey.enums.Role;
import com.pulse.survey.exception.ForbiddenException;
import com.pulse.survey.exception.ResourceNotFoundException;
import com.pulse.survey.repository.UserRepository;
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

    @Transactional
    public AuthTokenResponse googleLogin(GoogleAuthRequest request) {
        GoogleIdToken.Payload payload = googleVerifier.verify(request.idToken());

        String email = payload.getEmail();
        String googleSub = payload.getSubject();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        User user = userRepository.findByEmail(email)
                .map(existing -> updateExistingGoogleUser(existing, googleSub, name, picture))
                .orElseGet(() -> createGoogleUser(email, googleSub, name, picture));

        if (!user.isActive()) {
            throw new ForbiddenException("Your account is deactivated. Please contact HR.");
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        jwtService.storeRefreshToken(user.getId(), refreshToken);

        log.info("User {} logged in via Google SSO with role {}", email, user.getRole());
        return new AuthTokenResponse(accessToken, refreshToken, UserDto.from(user));
    }

    private User updateExistingGoogleUser(User user, String googleSub, String name, String picture) {
        user.setGoogleSub(googleSub);
        if (picture != null) {
            user.setAvatarUrl(picture);
        }
        if (name != null) {
            applyNameIfBlank(user, name);
        }
        return userRepository.save(user);
    }

    private User createGoogleUser(String email, String googleSub, String name, String picture) {
        User user = User.builder()
                .email(email)
                .googleSub(googleSub)
                .avatarUrl(picture)
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();

        if (name != null) {
            applyNameIfBlank(user, name);
        } else {
            String localPart = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
            user.setFirstName(localPart);
            user.setLastName("User");
        }

        User saved = userRepository.save(user);
        log.info("Auto-provisioned new Google user {} with role {}", email, Role.EMPLOYEE);
        return saved;
    }

    private void applyNameIfBlank(User user, String name) {
        if (user.getFirstName() != null && user.getLastName() != null) {
            return;
        }
        String[] parts = name.split(" ", 2);
        if (user.getFirstName() == null) {
            user.setFirstName(parts[0]);
        }
        if (user.getLastName() == null) {
            user.setLastName(parts.length > 1 ? parts[1] : "User");
        }
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
