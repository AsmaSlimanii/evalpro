package com.medianet.evalpro.Service;

//import com.medianet.evalpro.Dto.OptionDto;
//import com.medianet.evalpro.Dto.PreIdentificationDto;
//import com.medianet.evalpro.Dto.QuestionDto;
import com.medianet.evalpro.Dto.DossierDto;
import com.medianet.evalpro.Dto.PreIdentificationDto;
import com.medianet.evalpro.Dto.StepDto;
import com.medianet.evalpro.Entity.Dossier;
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
import org.springframework.stereotype.Service;

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


    public DossierServiceImpl(DossierRepository dossierRepository, UserRepository userRepository) {
        this.dossierRepository = dossierRepository;
        this.userRepository = userRepository;
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























//    @Override
//    @Transactional
//    public void saveStep1(Long userId, PreIdentificationDto dto) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé avec l'ID: " + userId));

        // ❌ À supprimer : cast dangereux
        // Dossier dossier = (Dossier) dossierRepository.findByUserId(userId);

        // ✅ À utiliser à la place :
//        Dossier dossier = dossierRepository.findTopByUserIdOrderByIdDesc(userId)
//                .orElseGet(() -> {
//                    Dossier d = new Dossier();
//                    d.setUser(user);
//                    d.setStatus(Dossier.Status.EN_COURS);
//                    return dossierRepository.save(d);
//                });

//        Step1PreIdentification step1 = Step1PreIdentification.builder()
//                .situation(dto.getSituation())
//                .nomEntreprise(dto.getNomEntreprise())
//                .secteur(dto.getSecteur())
//                .production(dto.isProduction())
//                .collecte(dto.isCollecte())
//                .transformation(dto.isTransformation())
//                .services(dto.isServices())
//                .transitionComment(dto.getTransitionComment())
//                .dossier(dossier)
//                .build();
//
//        dossier.setStep1PreIdentification(step1);
//        dossierRepository.save(dossier);
//    }




}