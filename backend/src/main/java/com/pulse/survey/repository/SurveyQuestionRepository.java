package com.pulse.survey.repository;

import com.pulse.survey.entity.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, UUID> {
    List<SurveyQuestion> findBySurveyIdOrderByQuestionOrder(UUID surveyId);
    void deleteBySurveyId(UUID surveyId);
}
