package com.pulse.survey.dto.response;

public record ImportRowError(
    int row,
    String email,
    String message
) {}
