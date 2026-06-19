package com.pulse.survey.repository;

import com.pulse.survey.entity.SurveyResponse;
import com.pulse.survey.enums.ResponseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("""
        SELECT sr FROM SurveyResponse sr
        JOIN FETCH sr.survey
        WHERE sr.user.id = :userId
        """)
    List<SurveyResponse> findByUserIdWithSurvey(@Param("userId") UUID userId);
    long countBySurveyIdAndStatus(UUID surveyId, ResponseStatus status);
    long countBySurveyIdAndStatusAndUserIdIn(UUID surveyId, ResponseStatus status, List<UUID> userIds);
}
