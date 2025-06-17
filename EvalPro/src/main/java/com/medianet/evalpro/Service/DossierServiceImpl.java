package com.medianet.evalpro.Service;

//import com.medianet.evalpro.Dto.OptionDto;
//import com.medianet.evalpro.Dto.PreIdentificationDto;
//import com.medianet.evalpro.Dto.QuestionDto;
import com.medianet.evalpro.Dto.PreIdentificationDto;
import com.medianet.evalpro.Entity.Dossier;
import com.medianet.evalpro.Entity.User;
import com.medianet.evalpro.Repository.DossierRepository;
import com.medianet.evalpro.Repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DossierServiceImpl implements DossierService {

    private final DossierRepository dossierRepository;
    private final UserRepository userRepository;

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