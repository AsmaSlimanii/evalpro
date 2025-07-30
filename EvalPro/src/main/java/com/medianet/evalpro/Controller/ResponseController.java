package com.medianet.evalpro.Controller;

import com.medianet.evalpro.Dto.DossierIdResponse;
import com.medianet.evalpro.Dto.ResponseRequestDTO;
import com.medianet.evalpro.Entity.Dossier;
import com.medianet.evalpro.Entity.Response;
import com.medianet.evalpro.Service.DossierService;
import com.medianet.evalpro.Service.ResponseService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/responses")
@RequiredArgsConstructor
public class ResponseController {

    private final ResponseService responseService;
    @Autowired
    private DossierService dossierService;


    // 🔹 CREATE :  Crée une nouvelle réponse (Response) générique (non liée à une étape spécifique ou à un dossier).
    @PostMapping
    public ResponseEntity<Response> createResponse(@RequestBody Response response) {
        return ResponseEntity.ok(responseService.save(response));
    }

    // 🔹 READ ALL : Récupère toutes les réponses existantes dans la base.
    @GetMapping
    public ResponseEntity<List<Response>> getAllResponses() {
        return ResponseEntity.ok(responseService.findAll());
    }

    // 🔹 READ ONE BY ID : Récupère une seule réponse par son ID.
    @GetMapping("/{id}")
    public ResponseEntity<Response> getResponseById(@PathVariable Long id) {
        return responseService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 UPDATE :  Met à jour une réponse existante identifiée par son ID.
    @PutMapping("/{id}")
    public ResponseEntity<Response> updateResponse(@PathVariable Long id, @RequestBody Response response) {
        try {
            Response updatedResponse = responseService.update(id, response);
            return ResponseEntity.ok(updatedResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 DELETE : Supprime une réponse identifiée par son ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResponse(@PathVariable Long id) {
        try {
            responseService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


//    // 🔹 READ ALL BY DOSSIER
//    @GetMapping("/dossier/{dossierId}")
//    public ResponseEntity<List<Response>> getByDossier(@PathVariable Long dossierId) {
//        return ResponseEntity.ok(responseService.findByDossierId(dossierId));
//    }
//
//    // 🔹 READ ALL BY USER
//    @GetMapping("/user/{userId}")
//    public ResponseEntity<List<Response>> getByUser(@PathVariable Long userId) {
//        return ResponseEntity.ok(responseService.findByUserId(userId));
//    }

    // 🔹 SEARCH + PAGINATION : Recherche paginée de réponses avec un filtre texte q
    //page : numéro de page
    //
    //per_page : nombre d’éléments par page
    //
    //q : texte à rechercher
    //Retourne : Un objet contenant :
    //
    //data : liste des réponses
    //
    //page, per_page, total : infos de pagination
    @GetMapping("/search")
    public ResponseEntity<Map<String,Object>> searchResponses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(name = "per_page", defaultValue = "10") int perPage,
            @RequestParam(name = "q", defaultValue = "") String query) {

        Page<Response> result = responseService.searchResponses(query, page, perPage);
        Map<String,Object> resp = new HashMap<>();
        resp.put("data",      result.getContent());
        resp.put("page",      result.getNumber());
        resp.put("per_page",  result.getSize());
        resp.put("total",     result.getTotalElements());

        return ResponseEntity.ok(resp);
    }

    //1. Création (sans dossier) : Sauvegarde les réponses d’un utilisateur à une étape (step) sans dossier existant.
    @PostMapping("/step{step_id}")
    public ResponseEntity<?> saveStepWithoutDossier(@RequestBody ResponseRequestDTO dto,
                                                    @PathVariable String step_id,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        dto.setStepId(Long.valueOf(step_id));
        String email = userDetails.getUsername(); // <- ici c’est OK
        Dossier dossier = dossierService.createNewDossierForUser(email);
        dto.setDossierId(dossier.getId());

        responseService.saveStepResponses(dto, email);
        return ResponseEntity.ok(Map.of("dossierId", dossier.getId()));
    }

////   // 2. Mise à jour (avec dossier existant)
//    @PostMapping("/step{step_id}/{dossier_id}")
//    public ResponseEntity<?> saveStep(@RequestBody ResponseRequestDTO dto,
//                                      @PathVariable String step_id,
//                                      @PathVariable String dossier_id,
//                                      @AuthenticationPrincipal UserDetails userDetails) {
//        if (userDetails == null) {
//            return ResponseEntity.status(403).body("Utilisateur non authentifié !");
//        }
//
//        dto.setStepId(Long.valueOf(step_id));
//        dto.setDossierId(Long.valueOf(dossier_id));
//
//        // ✅ AJOUTE CE LOG POUR DEBUG
//        System.out.println("📥 DTO reçu : step=" + dto.getStepId() + " | dossier=" + dto.getDossierId() + " | pillar=" + dto.getPillar());
//        responseService.saveStepResponses(dto, userDetails.getUsername());
//        return ResponseEntity.ok(Map.of("dossierId", dossier_id));
//    }


//But : Sauvegarde les réponses pour une étape spécifique et un dossier déjà existant.
//Logique :
//
//Récupère l’utilisateur via @AuthenticationPrincipal
//
//Enregistre les réponses via responseService.saveStepResponses
//
//Si l’utilisateur est ROLE_ADMIN et fournit un commentaire (dto.getComment()),
// alors le commentaire est aussi sauvegardé dans une table spéciale pour les commentaires admin.
//Retourne : L’ID du dossier traité.
@PostMapping("/step{step_id}/{dossier_id}")
public ResponseEntity<?> saveStep(@RequestBody ResponseRequestDTO dto,
                                  @PathVariable String step_id,
                                  @PathVariable String dossier_id,
                                  @AuthenticationPrincipal UserDetails userDetails) {

    if (userDetails == null) {
        return ResponseEntity.status(403).body("Utilisateur non authentifié !");
    }

    dto.setStepId(Long.valueOf(step_id));
    dto.setDossierId(Long.valueOf(dossier_id));

    responseService.saveStepResponses(dto, userDetails.getUsername());

    boolean isAdmin = userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

    if (isAdmin && dto.getComment() != null && !dto.getComment().isBlank()) {
        responseService.saveAdminComment(
                dto.getDossierId(),
                dto.getStepId(),
                dto.getComment(),
                userDetails.getUsername()
        );
    }

    return ResponseEntity.ok(Map.of("dossierId", dossier_id));
}


    @GetMapping("/step3-progress/{dossierId}")
    public ResponseEntity<Map<String, Boolean>> getStep3Progress(@PathVariable Long dossierId) {
        Map<String, Boolean> result = new HashMap<>();
        result.put("economique", responseService.isPillarCompleted(dossierId, "economique"));
        result.put("socio", responseService.isPillarCompleted(dossierId, "socio"));
        result.put("environnemental", responseService.isPillarCompleted(dossierId, "environnemental"));
        return ResponseEntity.ok(result);
    }



    //But : Vérifie si chaque pilier de l’étape 3 (auto-évaluation) est complété.
    //Logique :
    //
    //Appelle isPillarCompleted pour economique, socio, environnemental.
    //Retourne : Un objet JSON avec { economique: true/false, socio: ..., environnemental: ... }.
    @GetMapping("/step3-score/{dossierId}")
    public ResponseEntity<?> getPillarScores(@PathVariable Long dossierId) {
        Map<String, Object> scores = responseService.calculatePillarScores(dossierId);
        return ResponseEntity.ok(scores);
    }





//    @PostMapping("/admin-comment")
//    public ResponseEntity<?> saveAdminComment(@RequestParam Long dossierId,
//                                              @RequestParam Long stepId,
//                                              @RequestParam String comment,
//                                              @AuthenticationPrincipal UserDetails userDetails) {
//
//        responseService.saveAdminComment(dossierId, stepId, comment, userDetails.getUsername());
//        return ResponseEntity.ok("✅ Commentaire enregistré avec succès !");
//    }



}









