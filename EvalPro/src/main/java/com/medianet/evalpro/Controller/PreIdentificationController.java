//package com.medianet.evalpro.Controller;
//
//
//import com.medianet.evalpro.Dto.PreIdentificationDto;
//import com.medianet.evalpro.Service.DossierService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.security.Principal;
//
//@RestController
//@RequestMapping("/api/pre-identification")
//@RequiredArgsConstructor
//public class PreIdentificationController {
//    private final DossierService dossierService;
//
//    @PostMapping("/{userId}")
//    @PreAuthorize("#userId == principal.id") // Sécurité supplémentaire
//    public ResponseEntity<?> savePreIdentification(
//            @PathVariable Long userId,
//            @Valid @RequestBody PreIdentificationDto dto,
//            Principal principal) {
//
//
//        dossierService.saveStep1(userId, dto);
//        return ResponseEntity.ok().build(); // Retourne 200 sans contenu
//    }
//
//}
