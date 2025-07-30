package com.medianet.evalpro.Service;

import com.medianet.evalpro.Dto.ResponseRequestDTO;
import com.medianet.evalpro.Entity.Response;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ResponseService {
    // CRUD classique
    Response save(Response response);
    List<Response> findAll();
    Optional<Response> findById(Long id);
    Response update(Long id, Response response);
    void deleteById(Long id);

    // Recherche des réponses contenant le texte q dans leur valeur (value) avec pagination.
    Page<Response> searchResponses(String q, int page, int perPage);

    //Enregistre une série de réponses liées à une étape (step),
    // un formulaire (formId) et un dossier (dossierId).
    void saveStepResponses(ResponseRequestDTO dto, String name);

    //  void deleteByDossierIdAndStepIdAndQuestionId(Long dossierId, Long stepId, Long questionId);

    //Vérifie si le pilier (economique, socio, etc.) a été complété pour l'étape 3 du dossier donné.
    boolean isPillarCompleted(Long dossierId, String pillar);

    //Calcule les scores obtenus par l’utilisateur pour chaque pilier dans le dossier donné.
    Map<String, Object> calculatePillarScores(Long dossierId);

    //Permet à un administrateur de sauvegarder un commentaire lié à une étape d’un dossier utilisateur.
    void saveAdminComment(Long dossierId, Long stepId, String comment, String adminEmail);




    //Cette interface définit les contrats métier pour la gestion des réponses utilisateur (Response)
    // dans la plateforme EvalPro. Elle est ensuite implémentée par la classe ResponseServiceImpl.




//    // Listes par relation
//    List<Response> findByDossierId(Long dossierId);
//    List<Response> findByUserId(Long userId);
}