package com.pulse.survey.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.pulse.survey.dto.request.GoogleAuthRequest;
import com.pulse.survey.dto.response.AuthTokenResponse;
import com.pulse.survey.entity.User;
import com.pulse.survey.enums.Role;
import com.pulse.survey.exception.ForbiddenException;
import com.pulse.survey.exception.UnauthorizedException;
import com.pulse.survey.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceGoogleLoginTest {

    @Mock
    private GoogleTokenVerifierService googleVerifier;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void googleLogin_autoProvisionsNewEmployee() {
        GoogleIdToken.Payload payload = buildPayload("newuser@yourcompany.com", "google-sub-new", "New User");

        when(googleVerifier.verify("id-token")).thenReturn(payload);
        when(userRepository.findByEmail("newuser@yourcompany.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });
        when(jwtService.generateAccessToken(any(), any(), any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        AuthTokenResponse response = authService.googleLogin(new GoogleAuthRequest("id-token"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User created = userCaptor.getValue();
        assertThat(created.getEmail()).isEqualTo("newuser@yourcompany.com");
        assertThat(created.getRole()).isEqualTo(Role.EMPLOYEE);
        assertThat(created.getGoogleSub()).isEqualTo("google-sub-new");
        assertThat(created.getFirstName()).isEqualTo("New");
        assertThat(created.getLastName()).isEqualTo("User");
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.user().email()).isEqualTo("newuser@yourcompany.com");
    }

    @Test
    void googleLogin_invalidToken_propagatesUnauthorized() {
        when(googleVerifier.verify("bad-token"))
                .thenThrow(new UnauthorizedException("Invalid or expired Google token"));

        assertThatThrownBy(() -> authService.googleLogin(new GoogleAuthRequest("bad-token")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid or expired Google token");
    }

    @Test
    void googleLogin_wrongDomain_propagatesSecurityException() {
        when(googleVerifier.verify("token"))
                .thenThrow(new SecurityException("Access restricted to yourcompany.com accounts only"));

        assertThatThrownBy(() -> authService.googleLogin(new GoogleAuthRequest("token")))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void googleLogin_deactivatedUser_returnsForbidden() {
        GoogleIdToken.Payload payload = buildPayload("inactive@yourcompany.com", "sub", "Inactive User");
        User existing = User.builder()
                .id(UUID.randomUUID())
                .email("inactive@yourcompany.com")
                .firstName("Inactive")
                .lastName("User")
                .role(Role.EMPLOYEE)
                .isActive(false)
                .build();

        when(googleVerifier.verify("id-token")).thenReturn(payload);
        when(userRepository.findByEmail("inactive@yourcompany.com")).thenReturn(Optional.of(existing));
        when(userRepository.save(existing)).thenReturn(existing);

        assertThatThrownBy(() -> authService.googleLogin(new GoogleAuthRequest("id-token")))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("deactivated");
    }

    private GoogleIdToken.Payload buildPayload(String email, String subject, String name) {
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(email);
        payload.setEmailVerified(true);
        payload.setSubject(subject);
        payload.set("name", name);
        payload.set("hd", "yourcompany.com");
        return payload;
    }
}
