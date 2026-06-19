package com.pulse.survey.config;

import com.pulse.survey.dto.response.ResponseDTO;
import com.pulse.survey.dto.response.ResponseDTOList;
import com.pulse.survey.util.ApiResponseFactory;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.List;

@ControllerAdvice(basePackages = "com.pulse.survey.controller")
public class ApiResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        Class<?> parameterType = returnType.getParameterType();
        return parameterType != ResponseDTO.class && parameterType != ResponseDTOList.class;
    }

    @Override
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response
    ) {
        if (body instanceof ResponseDTO || body instanceof ResponseDTOList) {
            return body;
        }

        var servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
        var servletResponse = ((ServletServerHttpResponse) response).getServletResponse();
        String method = servletRequest.getMethod();
        HttpStatus status = HttpStatus.resolve(servletResponse.getStatus());
        String message = status == HttpStatus.CREATED
                ? "Created successfully"
                : ApiResponseFactory.messageForMethod(method);

        if (status == HttpStatus.NO_CONTENT) {
            servletResponse.setStatus(HttpStatus.OK.value());
        }

        if (body instanceof List<?> list) {
            return ApiResponseFactory.listSuccess(list, message);
        }

        return ApiResponseFactory.success(body, message);
    }
}
