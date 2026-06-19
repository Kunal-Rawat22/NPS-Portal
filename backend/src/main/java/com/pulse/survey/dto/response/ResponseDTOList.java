package com.pulse.survey.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ResponseDTOList(
    boolean status,
    String requestId,
    String message,
    List<?> data
) {}
