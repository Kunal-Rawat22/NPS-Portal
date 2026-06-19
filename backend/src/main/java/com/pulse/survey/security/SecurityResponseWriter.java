package com.pulse.survey.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulse.survey.dto.response.ResponseDTO;
import com.pulse.survey.util.ApiResponseFactory;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;

import java.io.IOException;

public final class SecurityResponseWriter {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private SecurityResponseWriter() {}

    public static void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ResponseDTO body = ApiResponseFactory.failure(message);
        MAPPER.writeValue(response.getWriter(), body);
    }
}
