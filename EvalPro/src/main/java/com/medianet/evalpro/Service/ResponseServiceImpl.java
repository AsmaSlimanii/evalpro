package com.medianet.evalpro.Service;


import com.medianet.evalpro.Dto.ResponseRequestDTO;
import com.medianet.evalpro.Dto.SingleResponseDTO;
import com.medianet.evalpro.Entity.*;
import com.medianet.evalpro.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ResponseServiceImpl implements ResponseService {


    @Autowired
    private ResponseRepository responseRepository;
    @Autowired private DossierRepository dossierRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private OptionRepository optionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private StepRepository stepRepository;


    public ResponseServiceImpl(ResponseRepository responseRepository) {
        this.responseRepository = responseRepository;
    }

    @Override
    public Response save(Response response) {
        return responseRepository.save(response);
    }

    @Override
    public List<Response> findAll() {
        return responseRepository.findAll();
    }

    @Override
    public Optional<Response> findById(Long id) {
        return responseRepository.findById(id);
    }

    @Override
    public Response update(Long id, Response response) {
        if (!responseRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        response.setId(id);
        return responseRepository.save(response);
    }

    @Override
    public void deleteById(Long id) {
        if (!responseRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        responseRepository.deleteById(id);
    }


    @Override
    public Page<Response> searchResponses(String q, int page, int perPage) {
        Pageable pageable = PageRequest.of(page, perPage, Sort.by("id").ascending());
        return responseRepository.findByValueContainingIgnoreCase(q, pageable);
    }





//cette Service pour enregistrer les réponses dynamiques et lier au dossier

    @Override
    public void saveStepResponses(ResponseRequestDTO dto, String userEmail) {
        System.out.println("📩 Enregistrement des réponses pour l'utilisateur : " + userEmail);

        // 🔐 Vérifications essentielles
        if (dto.getResponses() == null || dto.getResponses().isEmpty()) {
            System.out.println("⚠️ Aucune réponse reçue dans le payload.");
            return;
        }
        if (dto.getFormId() == null) {
            throw new RuntimeException("❌ formId manquant dans le payload.");
        }
        // ✅✅ AJOUTE CETTE VÉRIFICATION ICI
        for (SingleResponseDTO r : dto.getResponses()) {
            if (r.getQuestionId() == null) {
                throw new RuntimeException("❌ questionId est null dans une des réponses !");
            }

            if (r.getOptionIds() != null) {
                for (Long optId : r.getOptionIds()) {
                    if (optId == null) {
                        throw new RuntimeException("❌ optionId est null !");
                    }
                }
            }
        }


        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        Dossier dossier = dossierRepository.findByIdWithUser(dto.getDossierId()).orElseThrow(() -> new RuntimeException("Dossier introuvable"));

        Step step = stepRepository.findById(dto.getStepId()).orElseThrow(() -> new RuntimeException("Étape introuvable"));
        System.out.println("✅✅ Réponses enregistrées pour le dossier ID = " + dossier.getId());

// ✅ AJOUTE CETTE VÉRIFICATION :
        if (!dossier.getUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("⚠️ Vous n'avez pas accès à ce dossier !");
        }


        // ❌ Supprimer les anciennes réponses (pour éviter les doublons)

        responseRepository.deleteByFormIdAndDossierIdAndPillar(dto.getFormId(), dossier.getId(), dto.getPillar());

        System.out.println("🧹 Anciennes réponses supprimées pour le dossier " + dossier.getId());

        for (SingleResponseDTO r : dto.getResponses()) {
            System.out.println("🟡 Traitement de la question ID = " + r.getQuestionId());

            Question question = questionRepository.findById(r.getQuestionId()).orElseThrow(() ->
                    new RuntimeException("Question introuvable ID=" + r.getQuestionId()));

            // ✅ Réponse à choix multiple
            if (r.getOptionIds() != null && !r.getOptionIds().isEmpty()) {
                for (Long optId : r.getOptionIds()) {
                    Option opt = optionRepository.findById(optId).orElse(null);
                    if (opt != null) {
                        Response response = Response.builder()
                                .user(user)
                                .form(Form.builder().id(dto.getFormId()).build())
                                .dossier(dossier)
                                .step(step)
                                .question(question)
                                .option(opt)
                                .value(null)
                                .isValid(false)
                                .pillar(r.getPillar())
                                .build();
                        responseRepository.save(response);
                        System.out.println("✅ Réponse multiple enregistrée : questionId=" + r.getQuestionId() + " | optionId=" + optId);
                    } else {
                        System.out.println("⚠️ Option introuvable ID=" + optId);
                    }
                }
            }

            // ✅ Réponse texte/numérique
            if (r.getValue() != null && !r.getValue().isBlank()) {
                Response response = Response.builder()
                        .user(user)
                        .form(Form.builder().id(dto.getFormId()).build())
                        .dossier(dossier)
                        .step(step)
                        .question(question)
                        .value(r.getValue())
                        .option(null)
                        .isValid(false)
                        .pillar(r.getPillar())
                        .build();
                responseRepository.save(response);
                System.out.println("✅ Réponse texte enregistrée : questionId=" + r.getQuestionId() + " | valeur='" + r.getValue() + "'");
            }
        }

        System.out.println("✅✅ Toutes les réponses ont été enregistrées.");
    }
    @Override
    public boolean isPillarCompleted(Long dossierId, String pillar) {
        // Supposons que le nom du champ "step" correspond à "step3" pour Auto-Eval
        List<Response> responses = responseRepository.findByDossierIdAndStepAndPillar(dossierId, "step3", pillar);
        return responses != null && !responses.isEmpty();
    }




}






//    @Override
//    public List<Response> findByDossierId(Long dossierId) {
//        return responseRepository.findByDossierId(dossierId);
//    }
//
//    @Override
//    public List<Response> findByUserId(Long userId) {
//        return responseRepository.findByUserId(userId);
//    }

