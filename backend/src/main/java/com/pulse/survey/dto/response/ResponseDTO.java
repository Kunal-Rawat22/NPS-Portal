package com.pulse.survey.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ResponseDTO(
    boolean status,
    String requestId,
    String message,
    @JsonProperty @JsonInclude(JsonInclude.Include.ALWAYS) Object data
) {}
