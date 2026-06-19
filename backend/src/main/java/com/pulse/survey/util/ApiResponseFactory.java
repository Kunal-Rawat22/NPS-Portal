package com.pulse.survey.util;

import com.pulse.survey.dto.response.ResponseDTO;
import com.pulse.survey.dto.response.ResponseDTOList;

import java.util.List;
import java.util.UUID;

public final class ApiResponseFactory {

    private ApiResponseFactory() {}

    public static String newRequestId() {
        return UUID.randomUUID().toString();
    }

    public static ResponseDTO success(Object data, String message) {
        return new ResponseDTO(true, newRequestId(), message, data);
    }

    public static ResponseDTO failure(String message) {
        return new ResponseDTO(false, newRequestId(), message, null);
    }

    public static ResponseDTO failure(String message, Object data) {
        return new ResponseDTO(false, newRequestId(), message, data);
    }

    public static ResponseDTOList listSuccess(List<?> data, String message) {
        return new ResponseDTOList(true, newRequestId(), message, data);
    }

    public static String messageForMethod(String method) {
        if (method == null) {
            return "Request completed successfully";
        }
        return switch (method.toUpperCase()) {
            case "GET" -> "Data retrieved successfully";
            case "POST" -> "Created successfully";
            case "PUT", "PATCH" -> "Updated successfully";
            case "DELETE" -> "Deleted successfully";
            default -> "Request completed successfully";
        };
    }
}
