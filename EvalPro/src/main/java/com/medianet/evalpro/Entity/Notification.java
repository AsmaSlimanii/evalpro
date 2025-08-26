package com.medianet.evalpro.Entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    public enum Type { STEP_COMMENT, DOSSIER_ACCEPTED, DOSSIER_REJECTED, DOSSIER_NEEDS_CHANGES, NEEDS_CHANGES }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) private User user;     // destinataire
    @ManyToOne(fetch = FetchType.LAZY) private Dossier dossier;
    @ManyToOne(fetch = FetchType.LAZY) private Step step;     // optionnel (ex: commentaire d’étape)

    @Enumerated(EnumType.STRING)
    private Type type;

    private String title;           // "Nouveau commentaire sur l'étape 5"
    @Column(length = 2000)
    private String message;         // le texte/les remarques
    private String link;            // ex: "/projects/edit/{dossierId}/step5"
    private Boolean readFlag;

    private LocalDateTime createdAt;
}
