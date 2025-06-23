package com.medianet.evalpro.Controller;

//import com.medianet.evalpro.Dto.DossierDto;
import com.medianet.evalpro.Dto.DossierDto;
import com.medianet.evalpro.Dto.DossierIdResponse;
import com.medianet.evalpro.Dto.PreIdentificationDto;
import com.medianet.evalpro.Entity.Dossier;
import com.medianet.evalpro.Entity.User;
import com.medianet.evalpro.Repository.UserRepository;
import com.medianet.evalpro.Service.DossierService;
import com.medianet.evalpro.Util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dossiers")
@RequiredArgsConstructor

public class DossierController {

    private final DossierService dossierService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;


    // 🔹 CREATE
    @PostMapping
    public ResponseEntity<Dossier> create(@RequestBody Dossier dossier) {
        return ResponseEntity.ok(dossierService.save(dossier));
    }

    // 🔹 READ ALL
    @GetMapping
    public ResponseEntity<List<Dossier>> getAllDossiers() {
        return ResponseEntity.ok(dossierService.findAll());
    }

    // 🔹 READ ONE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Dossier> getDossierById(@PathVariable Long id) {
        return dossierService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Dossier> updateDossier(@PathVariable Long id, @RequestBody Dossier dossier) {
        try {
            Dossier updatedDossier = dossierService.update(id, dossier);
            return ResponseEntity.ok(updatedDossier);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDossier(@PathVariable Long id) {
        try {
            dossierService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

//    // 🔹 READ ALL BY USER
//    @GetMapping("/user/{userId}")
//    public ResponseEntity<List<Dossier>> getByUser(@PathVariable Long userId) {
//        return ResponseEntity.ok(dossierService.findByUserId(userId));
//    }


    // 🔹 SEARCH + PAGINATION
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchDossiers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "per_page", defaultValue = "10") int perPage,
            @RequestParam(name = "q", defaultValue = "") String query
    ) {
        Page<Dossier> result = dossierService.searchDossiers(query, page, perPage);

        Map<String, Object> resp = new HashMap<>();
        resp.put("data", result.getContent());
        resp.put("page", result.getNumber());
        resp.put("per_page", result.getSize());
        resp.put("total", result.getTotalElements());

        return ResponseEntity.ok(resp);
    }
    @PostMapping("/create-from-step1")
    public ResponseEntity<DossierIdResponse> createFromStep1(
            @RequestHeader("Authorization") String token,
            @RequestBody PreIdentificationDto dto) {

        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        Dossier newDossier = dossierService.createDossier(dto, email);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new DossierIdResponse(newDossier.getId()));
    }

    @GetMapping("/user")
    public ResponseEntity<List<DossierDto>> getUserDossiers(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        List<DossierDto> dossiers = dossierService.getUserDossiers(email);
        return ResponseEntity.ok(dossiers);
    }










//    //Il fournit une API sécurisée REST qui retourne tous les dossiers (projets) de l’utilisateur connecté.
//    @GetMapping("/user")
//    public List<DossierDto> getUserDossiers(@RequestHeader("Authorization") String token) {
//        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
//        User user = userRepository.findByEmail(email).orElseThrow();
//
//        return user.getDossiers().stream()
//                .map(dossier -> {
//                    DossierDto dto = new DossierDto();
//                    dto.setId(dossier.getId());
//                    dto.setStatus(dossier.getStatus().name());
//                    dto.setCreatedAt(dossier.getCreatedAt().toString());
//                    return dto;
//                })
//                .toList();
//    }



    //🔁 Fonctionnement :
    //Le client envoie un token JWT dans l’en-tête Authorization
    //
    //Le backend extrait l’email de l’utilisateur
    //
    //Il cherche cet utilisateur en base de données
    //
    //Il récupère sa liste de dossiers
    //
    //Il convertit chaque dossier en DossierDto
    //
    //Il retourne une liste JSON à Angular

}
