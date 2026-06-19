package com.pulse.survey.repository;

import com.pulse.survey.entity.QuestionResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionResponseRepository extends JpaRepository<QuestionResponse, UUID> {

    List<QuestionResponse> findBySurveyResponseId(UUID surveyResponseId);

    @Query("""
        SELECT qr FROM QuestionResponse qr
        JOIN qr.surveyResponse sr
        WHERE sr.survey.id = :surveyId AND sr.status = 'SUBMITTED'
        """)
    List<QuestionResponse> findAllSubmittedBySurveyId(@Param("surveyId") UUID surveyId);

    @Query("""
        SELECT qr FROM QuestionResponse qr
        JOIN qr.surveyResponse sr
        WHERE sr.survey.id = :surveyId AND sr.user.id IN :userIds AND sr.status = 'SUBMITTED'
        """)
    List<QuestionResponse> findBySurveyIdAndUserIds(@Param("surveyId") UUID surveyId, @Param("userIds") List<UUID> userIds);
}
