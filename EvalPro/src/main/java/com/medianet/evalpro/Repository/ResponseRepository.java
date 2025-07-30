package com.medianet.evalpro.Repository;


import com.medianet.evalpro.Entity.Response;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


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




    //Supprime les réponses d’un formulaire donné pour un dossier et une étape spécifique.
    @Modifying
    @Query("DELETE FROM Response r WHERE r.form.id = :formId AND r.dossier.id = :dossierId AND r.step.id = :stepId")
    void deleteByFormIdAndDossierIdAndStepId(@Param("formId") Long formId,
                                             @Param("dossierId") Long dossierId,
                                             @Param("stepId") Long stepId);

    //Comme ci-dessus, mais plus ciblé : filtre aussi par pilier (pillar) — utilisé notamment dans l’étape 3 (auto-évaluation).
    @Modifying
    @Query("DELETE FROM Response r WHERE r.form.id = :formId AND r.dossier.id = :dossierId AND r.pillar = :pillar AND r.step.id = :stepId")
    void deleteByFormIdAndDossierIdAndPillarAndStepId(@Param("formId") Long formId,
                                                      @Param("dossierId") Long dossierId,
                                                      @Param("pillar") String pillar,
                                                      @Param("stepId") Long stepId);



    //Retourne les réponses pour un dossier, un nom d’étape (step.name), et un pilier.
    //Utile pour vérifier si un pilier a été rempli dans l’étape 3.
    @Query("SELECT r FROM Response r WHERE r.dossier.id = :dossierId AND r.step.name = :step AND r.question.pillar = :pillar")
    List<Response> findByDossierIdAndStepAndPillar(
            @Param("dossierId") Long dossierId,
            @Param("step") String step,
            @Param("pillar") String pillar
    );


    boolean existsByDossierIdAndStepId(Long dossierId, long l);
    boolean existsByDossierIdAndQuestionPillar(Long dossierId, String pillar);

    //une méthode pour compter les réponses par pilier et dossier
    @Query("SELECT COUNT(r) FROM Response r WHERE r.dossier.id = :dossierId AND r.question.pillar = :pillar AND r.step.id = 3")
    Long countResponsesByDossierIdAndPillar(@Param("dossierId") Long dossierId, @Param("pillar") String pillar);




}


//Cette interface hérite de JpaRepository<Response, Long>, ce qui lui fournit déjà toutes les opérations CRUD de base :
//
//findAll(), findById(), save(), deleteById()...
//
//Elle ajoute ici des requêtes personnalisées pour gérer la logique métier autour des réponses utilisateur (Response), notamment :
//
//la recherche,
//
//la suppression ciblée,
//
//la récupération par dossier, pilier ou utilisateur,
//
//les vérifications d'existence.