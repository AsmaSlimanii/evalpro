package com.medianet.evalpro.Service;

import com.medianet.evalpro.Dto.DossierDto;
import com.medianet.evalpro.Dto.PreIdentificationDto;

import com.medianet.evalpro.Entity.Dossier;
import com.medianet.evalpro.Entity.Notification; // <-- OBLIGATOIRE

import com.medianet.evalpro.Entity.User;
import com.medianet.evalpro.Repository.DossierRepository;
import com.medianet.evalpro.Repository.ResponseAdminRepository;
import com.medianet.evalpro.Repository.ResponseRepository;
import com.medianet.evalpro.Repository.UserRepository;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DossierServiceImpl implements DossierService {

    private final DossierRepository dossierRepository;
    private final UserRepository userRepository;
    @Autowired
    private ResponseAdminRepository responseAdminRepository;
    @Autowired
    private ResponseRepository responseRepository;
    // ✅ injection du service de notifications
    @Autowired private  NotificationService notificationService;


    public DossierServiceImpl(DossierRepository dossierRepository, UserRepository userRepository, NotificationService notificationService) {
        this.dossierRepository = dossierRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    public Dossier save(Dossier dossier) {
        return dossierRepository.save(dossier);
    }

    @Override
    public List<Dossier> findAll() {
        return dossierRepository.findAll();
    }

    @Override
    public Optional<Dossier> findById(Long id) {
        return dossierRepository.findById(id);
    }

    @Override
    public Dossier update(Long id, Dossier dossier) {
        if (!dossierRepository.existsById(id)) {
            throw new RuntimeException("Dossier non trouvé");
        }
        dossier.setId(id);
        return dossierRepository.save(dossier);
    }

    @Override
    public void deleteById(Long id) {
        if (!dossierRepository.existsById(id)) {
            throw new RuntimeException("Dossier non trouvé");
        }
        dossierRepository.deleteById(id);
    }
//
//    @Override
//    public List<Dossier> findByUserId(Long userId) {
//        return dossierRepository.findByUserId(userId);
//    }

    @Override
    public Page<Dossier> searchDossiers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return dossierRepository.findByStatusContainingIgnoreCase(query, pageable);
    }





//Service pour créer un Dossier après la soumission du Step 1

    public Dossier createNewDossierForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Dossier dossier = Dossier.builder()
                .user(user)
                .createdAt(LocalDateTime.now())
                .status(Dossier.Status.EN_COURS)
                .build();

        return dossierRepository.save(dossier);
    }


    public Dossier createDossier(PreIdentificationDto dto, String email)  {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Dossier dossier = Dossier.builder()
                .user(user)
                .createdAt(LocalDateTime.now())
                .status(Dossier.Status.EN_COURS)
                .nomOfficielProjet(dto.getNomOfficielProjet())  // maintenant ça fonctionne
                .build();

        return dossierRepository.save(dossier);
    }
    @Override
    public List<DossierDto> getUserDossiers(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Dossier> dossiers = dossierRepository.findByUserId(user.getId());

        return dossiers.stream()
                .map(d -> {
                    // ✅ Logs de debug pour vérifier les données
                    System.out.println(">> ID: " + d.getId());
                    System.out.println(">> Nom: " + d.getNomOfficielProjet());
                    System.out.println(">> CreatedAt: " + d.getCreatedAt());
                    System.out.println(">> UpdatedAt: " + d.getUpdatedAt());

                    return DossierDto.builder()
                            .id(d.getId())
                            .code("Pr-" + d.getId())
                            // ✅ Titre par défaut si null
                            .nomOfficielProjet(
                                    d.getNomOfficielProjet() != null ? d.getNomOfficielProjet() : "Titre manquant"
                            )
                            .statusLabel("Dossier en cours de préparation")
                            .createdAt(d.getCreatedAt())
                            // ✅ fallback si updatedAt est null
                            .updatedAt(d.getUpdatedAt() != null ? d.getUpdatedAt() : d.getCreatedAt())
                            .steps(generateStepProgress(d))
                            .lastCompletedStep(d.getLastCompletedStep() + 1)
                            .categorie(d.getCategorie() != null ? d.getCategorie() : "-")
                            .build();
                })
                .collect(Collectors.toList());
    }
    @Transactional
    public void deleteDossierIfOwnedByUser(Long dossierId, String email) {
        Dossier dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifie si l'utilisateur est propriétaire ou admin
        if (!dossier.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
            throw new RuntimeException("Suppression non autorisée.");
        }

        // ⚠️ Supprimer d'abord les réponses associées
        responseRepository.deleteByDossierId(dossierId);
        responseAdminRepository.deleteByDossierId(dossierId);

        // Ensuite, supprimer le dossier
        dossierRepository.delete(dossier);
    }







    //    private List<StepDto> generateStepProgress(Dossier dossier) {
//        List<StepDto> steps = new ArrayList<>();
//        for (int i = 1; i <= 5; i++) {
//            new StepDto(i, i <= dossier.getLastCompletedStep())
//            ;
//        }
//        return steps;
//    }

private Map<String, Integer> generateStepProgress(Dossier dossier) {
    Map<String, Integer> steps = new LinkedHashMap<>();
    int lastStep = Optional.of(dossier.getLastCompletedStep()).orElse(0);

    for (int i = 1; i <= 5; i++) {
        String stepName = "Step " + i;
        int progress = (i <= lastStep) ? 100 : 0;
        steps.put(stepName, progress);
    }
    return steps;


}

    @Override
    @Transactional
    public Dossier updateStatus(Long dossierId, Dossier.Status status, String message, String adminEmail) {
        // (facultatif) vérifier l’admin
        userRepository.findByEmail(adminEmail).orElseThrow(() -> new RuntimeException("Admin introuvable"));

        Dossier dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));

        dossier.setStatus(status);
        dossier.setUpdatedAt(LocalDateTime.now());
        dossier = dossierRepository.save(dossier);

        // mapping Status -> Notification.Type
        Notification.Type type;
        String finalMessage;

        switch (status) {
            case ACCEPTE:
            case VALIDE: // tu peux considérer VALIDE comme "accepté"
                type = Notification.Type.DOSSIER_ACCEPTED;
                finalMessage = (message == null || message.isBlank())
                        ? "Votre dossier a été accepté."
                        : message.trim();
                break;

            case REJETE:
                type = Notification.Type.DOSSIER_REJECTED;
                finalMessage = (message == null || message.isBlank())
                        ? "Votre dossier a été refusé. Veuillez consulter les remarques."
                        : message.trim();
                break;

            case EN_COURS:
            default:
                type = Notification.Type.DOSSIER_NEEDS_CHANGES;
                finalMessage = (message == null || message.isBlank())
                        ? "Des compléments sont requis pour finaliser votre dossier."
                        : message.trim();
        }

        // envoi de la notification
        notificationService.notifyStatus(dossier, type, finalMessage);

        return dossier;
    }


    // DossierServiceImpl
    @Override
    @Transactional
    public Dossier submitLatestForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        Dossier d = dossierRepository.findTopByUserIdOrderByIdDesc(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucun dossier à soumettre"));

        int last = Optional.ofNullable(d.getLastCompletedStep()).orElse(0);
        if (last < 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Toutes les étapes ne sont pas terminées.");
        }

        d.setStatus(Dossier.Status.SOUMIS);
        d.setSubmittedAt(LocalDateTime.now());
        d.setUpdatedAt(LocalDateTime.now());
        return dossierRepository.save(d);
    }

    @Override
    @Transactional
    public void touchDraftForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        dossierRepository.findTopByUserIdOrderByIdDesc(user.getId())
                .ifPresent(d -> {
                    d.setUpdatedAt(LocalDateTime.now());
                    dossierRepository.save(d);
                });
    }

    @Override
    public Page<Dossier> listByStatus(Dossier.Status status, int page, int size) {
        return dossierRepository.findByStatusOrderBySubmittedAtDesc(
                status, PageRequest.of(page, size));
    }

    @Override
    public Dossier getForPdf(Long id) {
        return dossierRepository.findByIdWithResponses(id)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable"));
    }

    @Override
    @jakarta.transaction.Transactional
    public void markStepCompleted(Long dossierId, int stepOrder) {
        Dossier d = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));
        int last = Optional.ofNullable(d.getLastCompletedStep()).orElse(0);
        if (stepOrder > last) {
            d.setLastCompletedStep(stepOrder);
            d.setUpdatedAt(LocalDateTime.now());
            // pas besoin d'appeler save() ici si l'entité est managée, Hibernate flushera au commit
            // si tu préfères, tu peux faire: dossierRepository.save(d);
        }
    }

    // DossierServiceImpl.java

    // DossierServiceImpl.java

    // DossierServiceImpl.java

    @Override
    @Transactional
    public Dossier submitForUser(String email, Long dossierId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        Dossier d = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dossier introuvable"));

        boolean isOwner = (d.getUser() != null && Objects.equals(d.getUser().getId(), user.getId()));
        boolean isAdmin = (user.getRole() == User.Role.ADMIN);

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Dossier non autorisé");
        }

        int last = Optional.ofNullable(d.getLastCompletedStep()).orElse(0);

        // ✅ l’ADMIN peut forcer la soumission
        if (last < 5 && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Toutes les étapes ne sont pas terminées.");
        }

        d.setStatus(Dossier.Status.SOUMIS);
        d.setSubmittedAt(LocalDateTime.now());
        d.setUpdatedAt(LocalDateTime.now());
        return dossierRepository.save(d);
    }























}