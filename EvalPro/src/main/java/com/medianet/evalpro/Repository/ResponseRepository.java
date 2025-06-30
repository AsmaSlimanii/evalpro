package com.medianet.evalpro.Repository;


import com.medianet.evalpro.Entity.Response;
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
    @Transactional
    void deleteByFormIdAndDossierIdAndPillar(Long formId, Long dossierId, String pillar);

    //  void deleteByFormIdAndDossierIdAndQuestionId(Long formId, Long dossierId, Long questionId);
  @Query("SELECT r FROM Response r WHERE r.dossier.id = :dossierId AND r.step.name = :step AND r.question.pillar = :pillar")
  List<Response> findByDossierIdAndStepAndPillar(
          @Param("dossierId") Long dossierId,
          @Param("step") String step,
          @Param("pillar") String pillar
  );



    boolean existsByDossierIdAndStepId(Long dossierId, long l);

    @Query("SELECT COUNT(r) > 0 FROM Response r WHERE r.dossier.id = :dossierId AND r.step.id = 3 AND r.question.pillar = :pillar")
    boolean existsByDossierIdAndPillar(@Param("dossierId") Long dossierId, @Param("pillar") String pillar);

}
