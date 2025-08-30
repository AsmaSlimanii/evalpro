package com.medianet.evalpro.Dto;

import com.medianet.evalpro.Entity.Dossier;
import java.time.LocalDateTime;
//
public record AdminDossierItemDto(Long id, String titre, String ownerEmail,
                                  LocalDateTime submittedAt, String status) {
    public static AdminDossierItemDto from(Dossier d) {
        return new AdminDossierItemDto(
                d.getId(),
                d.getNomOfficielProjet() != null ? d.getNomOfficielProjet() : "Sans titre",
                d.getUser() != null ? d.getUser().getEmail() : "-",
                d.getSubmittedAt(),
                d.getStatus() != null ? d.getStatus().name() : "EN_COURS"
        );
    }
}
