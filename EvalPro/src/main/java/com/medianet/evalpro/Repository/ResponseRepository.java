package com.medianet.evalpro.Repository;


import com.medianet.evalpro.Entity.Response;
import com.medianet.evalpro.Entity.Step;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ResponseRepository extends JpaRepository<Response, Long> {

    // 1) Recherche paginée sur la valeur de la réponse
    Page<Response> findByValueContainingIgnoreCase(String value, Pageable pageable);

    // 2) Liste brute des réponses d’un dossier
    List<Response> findByDossierId(Long dossierId);

    // 3) Liste brute des réponses d’un utilisateur
    List<Response> findByUserId(Long userId);

    List<Response> findByFormIdAndDossierId(Long id, Long dossierId);

    // 🔥 Méthode de suppression à ajouter :
 //   void deleteByDossierIdAndStepIdAndQuestionId(Long dossierId, Long stepId, Long questionId);



    @Modifying
    @Query("DELETE FROM Response r WHERE r.form.id = :formId AND r.dossier.id = :dossierId AND r.step.id = :stepId")
    void deleteByFormIdAndDossierIdAndStepId(@Param("formId") Long formId,
                                             @Param("dossierId") Long dossierId,
                                             @Param("stepId") Long stepId);

    @Modifying
    @Query("DELETE FROM Response r WHERE r.form.id = :formId AND r.dossier.id = :dossierId AND r.pillar = :pillar AND r.step.id = :stepId")
    void deleteByFormIdAndDossierIdAndPillarAndStepId(@Param("formId") Long formId,
                                                      @Param("dossierId") Long dossierId,
                                                      @Param("pillar") String pillar,
                                                      @Param("stepId") Long stepId);




    @Query("SELECT r FROM Response r WHERE r.dossier.id = :dossierId AND r.step.name = :step AND r.question.pillar = :pillar")
    List<Response> findByDossierIdAndStepAndPillar(
            @Param("dossierId") Long dossierId,
            @Param("step") String step,
            @Param("pillar") String pillar
    );


    boolean existsByDossierIdAndStepId(Long dossierId, long l);
    boolean existsByDossierIdAndQuestionPillar(Long dossierId, String pillar);



}
