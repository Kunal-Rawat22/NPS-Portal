package com.pulse.survey.dto.response;

public record AuthTokenResponse(
    String accessToken,
    String refreshToken,
    UserDto user
) {}
