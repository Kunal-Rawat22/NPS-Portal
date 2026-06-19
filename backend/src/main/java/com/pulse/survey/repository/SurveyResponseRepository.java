package com.pulse.survey.repository;

import com.pulse.survey.entity.SurveyResponse;
import com.pulse.survey.enums.ResponseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, UUID> {
    Optional<SurveyResponse> findBySurveyIdAndUserId(UUID surveyId, UUID userId);
    List<SurveyResponse> findBySurveyId(UUID surveyId);
    List<SurveyResponse> findBySurveyIdAndStatus(UUID surveyId, ResponseStatus status);
    List<SurveyResponse> findByUserId(UUID userId);
    long countBySurveyIdAndStatus(UUID surveyId, ResponseStatus status);
}
