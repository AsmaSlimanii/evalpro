package com.medianet.evalpro.Repository;

import com.medianet.evalpro.Entity.Question;
import com.medianet.evalpro.Entity.Step;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    // 1) Recherche paginée par texte
    Page<Question> findByTextContainingIgnoreCase(String text, Pageable pageable);

    // 2) Liste brute des questions d’un Form
    List<Question> findByFormsId(Long formId);
//    List<Question> findByStepAndPillar(Step step, String pillar);

    //une méthode pour compter les questions par pilier
    @Query("SELECT COUNT(q) FROM Question q WHERE q.pillar = :pillar AND q.step.id = :stepId")
    Long countQuestionsByPillarAndStep(@Param("pillar") String pillar, @Param("stepId") Long stepId);


    //  List<Question> findByFormId(Long id);
}

