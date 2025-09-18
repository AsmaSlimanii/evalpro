package com.medianet.evalpro.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StepHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) private Dossier dossier;
    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = true)   // <— important
    private Step step;


    /** Qui a fait l’action (admin ou client) */
    @ManyToOne(optional = false) private User actor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StepHistoryAction action;

    /** Texte libre : commentaire admin, message système, etc. */
    @Column(length = 4000)
    private String description;

    /** Visible côté client ? (true = montre dans l’historique UI client) */
    private boolean visibleToClient = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }


    public enum StepHistoryAction {
        COMMENT_ADDED,        // commentaire créé
        COMMENT_UPDATED,      // commentaire modifié
        FORM_SUBMITTED,       // client a (re)soumis l’étape
        STEP_SAVED,           // brouillon enregistré
        STATUS_CHANGED,       // statut dossier changé (ACCEPTE/REJETE/…)
        FILE_UPLOADED,        // fichier déposé
        ANSWER_UPDATED        // modification d’une réponse
    }
}
