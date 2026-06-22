package com.pulse.survey.exception;

import com.pulse.survey.dto.response.ResponseDTO;
import com.pulse.survey.util.ApiResponseFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ResponseDTO> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseFactory.failure(ex.getMessage()));
    }

    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class})
    public ResponseEntity<ResponseDTO> handleForbidden(Exception ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponseFactory.failure(ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ResponseDTO> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponseFactory.failure(ex.getMessage()));
    }

    @ExceptionHandler({IllegalArgumentException.class, BadRequestException.class})
    public ResponseEntity<ResponseDTO> handleBadRequest(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseFactory.failure(ex.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ResponseDTO> handleSecurity(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponseFactory.failure(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDTO> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(err -> {
            String field = ((FieldError) err).getField();
            errors.put(field, err.getDefaultMessage());
        });
        return ResponseEntity.badRequest()
                .body(ApiResponseFactory.failure("Validation failed", errors));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ResponseDTO> handleMissingParam(MissingServletRequestParameterException ex) {
        return ResponseEntity.badRequest()
                .body(ApiResponseFactory.failure("Missing required parameter: " + ex.getParameterName()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ResponseDTO> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(ApiResponseFactory.failure("Invalid request body"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ResponseDTO> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest()
                .body(ApiResponseFactory.failure("Invalid value for parameter: " + ex.getName()));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ResponseDTO> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponseFactory.failure("HTTP method not supported: " + ex.getMethod()));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ResponseDTO> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(ApiResponseFactory.failure("Media type not supported"));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ResponseDTO> handleNotFoundEndpoint(NoHandlerFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseFactory.failure("Endpoint not found: " + ex.getRequestURL()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDTO> handleGeneral(Exception ex) {
        log.error("Unhandled exception: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseFactory.failure("An unexpected error occurred"));
    }
}
