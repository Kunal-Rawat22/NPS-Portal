package com.pulse.survey.dto.request;

import jakarta.validation.constraints.NotBlank;

public record GoogleAuthRequest(@NotBlank String idToken) {}
