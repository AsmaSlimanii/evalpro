    package com.medianet.evalpro.Service;

    import com.medianet.evalpro.Entity.Dossier;
    import com.medianet.evalpro.Entity.Notification;
    import com.medianet.evalpro.Entity.Step;
    import com.medianet.evalpro.Repository.NotificationRepository;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.time.LocalDateTime;

    @Service
    @RequiredArgsConstructor
    @Transactional // garantit la transaction pour les save/update
    public class NotificationServiceImpl implements NotificationService {

        private final NotificationRepository repo;

        @Override
        public void notifyStepComment(Dossier dossier, Step step, String title, String message, String link) {
            if (dossier == null || dossier.getUser() == null) return;

            Notification n = Notification.builder()
                    .user(dossier.getUser())
                    .dossier(dossier)
                    .step(step)
                    .type(Notification.Type.STEP_COMMENT)
                    .title(title != null ? title : "Commentaire de l’administrateur")
                    .message(message)
                    .link(link != null ? link : ("/projects/edit/" + dossier.getId()))
                    .readFlag(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            repo.save(n);
        }

        @Override
        public void notifyStatus(Dossier dossier, Notification.Type type, String message) {
            if (dossier == null || dossier.getUser() == null || type == null) return;

            String title =
                    (type == Notification.Type.DOSSIER_ACCEPTED) ? "Dossier accepté" :
                            (type == Notification.Type.DOSSIER_REJECTED) ? "Dossier refusé" :
                                    "Modifications requises";

            Notification n = Notification.builder()
                    .user(dossier.getUser())
                    .dossier(dossier)
                    .type(type)
                    .title(title)
                    .message(message)
                    .link("/projects/edit/" + dossier.getId())
                    .readFlag(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            repo.save(n);
        }
    }
