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
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service // Déclare la classe comme service Spring (disponible à l’injection)
@Transactional // Toutes les méthodes publiques s’exécutent dans une transaction
public class ResponseServiceImpl implements ResponseService {  // Implémente l’interface métier ResponseService


    @Autowired
    private ResponseRepository responseRepository;
    @Autowired private DossierRepository dossierRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private OptionRepository optionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private StepRepository stepRepository;
    @Autowired private  ResponseAdminRepository responseAdminRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private StepHistoryService stepHistoryService;



    public ResponseServiceImpl(ResponseRepository responseRepository) {
        this.responseRepository = responseRepository;
    }


    //But : Sauvegarde une réponse simple dans la base.
    //Utilisé par : le contrôleur lors de la création générique (POST /api/responses).
    @Override
    public Response save(Response response) {
        return responseRepository.save(response);
    }

    //But : Récupère toutes les réponses en base.
    //Utilisé pour : affichage ou admin/debug.
    @Override
    public List<Response> findAll() {
        return responseRepository.findAll();
    }

    //But : Récupère une réponse par son ID.
    @Override
    public Optional<Response> findById(Long id) {
        return responseRepository.findById(id);
    }

    //But : Met à jour une réponse existante.
    //Validation : Vérifie d’abord que l’ID existe. Sinon, une exception est levée.
    @Override
    public Response update(Long id, Response response) {
        if (!responseRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        response.setId(id);
        return responseRepository.save(response);
    }
    //But : Supprime une réponse si elle existe, sinon lève une erreur.
    @Override
    public void deleteById(Long id) {
        if (!responseRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        responseRepository.deleteById(id);
    }

    //But : Recherche paginée de réponses contenant le texte q dans leur value.
    @Override
    public Page<Response> searchResponses(String q, int page, int perPage) {
        Pageable pageable = PageRequest.of(page, perPage, Sort.by("id").ascending());
        return responseRepository.findByValueContainingIgnoreCase(q, pageable);
    }





//cette Service pour enregistrer les réponses dynamiques et lier au dossier
//But : Sauvegarde toutes les réponses d’un utilisateur pour une étape donnée.
//
//Étapes de traitement :
//
//Vérifie la présence de responses, formId, questionId, etc.
//
//Récupère l’utilisateur, le dossier, l’étape
//
//Vérifie si l’utilisateur est bien le propriétaire du dossier
//
//Supprime les anciennes réponses de cette étape (évite les doublons)
//
//Sauvegarde les nouvelles réponses :
//
//Choix multiples → optionIds
//
//Réponses texte/numériques → value
//
//Enregistre la pillar si présent
//
//(optionnel) Gère le champ UPLOAD pour les fichiers


    // --- Service d’enregistrement d’un lot de réponses liées à un dossier/étape (avec gestion pilier & doublons) ---
    @Override
    public void saveStepResponses(ResponseRequestDTO dto, String userEmail) {


        System.out.println("📩 Enregistrement des réponses pour l'utilisateur : " + userEmail);
       // System.out.println("👤 Utilisateur connecté : " + userEmail);

        // 🔐 Vérifications essentielles
        if (dto.getResponses() == null || dto.getResponses().isEmpty()) {
            System.out.println("⚠️ Aucune réponse reçue dans le payload.");
            return;
        }
        if (dto.getFormId() == null) { // formId obligatoire
            throw new RuntimeException("❌ formId manquant dans le payload.");
        }
        // ✅ Validation des identifiants de question/option
        for (SingleResponseDTO r : dto.getResponses()) { // Si options présentes
            if (r.getQuestionId() == null) { // questionId obligatoire
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

        // Récupère l’utilisateur par email
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        // Récupère le dossier + son owner
        Dossier dossier = dossierRepository.findByIdWithUser(dto.getDossierId()).orElseThrow(() -> new RuntimeException("Dossier introuvable"));
        // Récupère l’étape
        Step step = stepRepository.findById(dto.getStepId()).orElseThrow(() -> new RuntimeException("Étape introuvable"));
        System.out.println("✅✅ Réponses enregistrées pour le dossier ID = " + dossier.getId());

// ✅ AJOUTE CETTE VÉRIFICATION :
        // 🚫 Si l'utilisateur est admin, il peut uniquement enregistrer un commentaire
        if (user.getRole() == User.Role.ADMIN) {
            // 💬 Uniquement le commentaire admin autorisé
            if (dto.getComment() != null && !dto.getComment().isBlank()) {
                saveAdminComment(dossier.getId(), step.getId(), dto.getComment(), userEmail);
                System.out.println("✅ Commentaire admin enregistré.");
            } else {
                System.out.println("ℹ️ Admin sans commentaire : aucune réponse enregistrée.");
            }
            return; // ⛔ Stopper ici, ne pas enregistrer les réponses !
        }


//        // 🚫 Bloquer les admins pour la modification des réponses
//        if (user.getRole() == User.Role.ADMIN && dto.getResponses() != null && !dto.getResponses().isEmpty()) {
//            throw new AccessDeniedException("Les administrateurs ne peuvent pas modifier les réponses.");
//        }




        // ❌ Supprimer les anciennes réponses (pour éviter les doublons)

        // normalise le pilier
        String pillar = dto.getPillar() == null ? null : dto.getPillar().trim().toUpperCase();

        if (pillar != null && !pillar.isBlank()) {
            // Supprime uniquement les réponses de CE pilier pour ce form/dossier/step
            responseRepository.deleteByFormIdAndDossierIdAndStepIdAndPillarIgnoreCase(
                    dto.getFormId(), dossier.getId(), step.getId(), pillar
            );
        } else {
            // Sinon supprime au scope (form + dossier + step) sans pilier
            responseRepository.deleteByFormIdAndDossierIdAndStepId(
                    dto.getFormId(), dossier.getId(), dto.getStepId()
            );
        }


        System.out.println("🧹 Anciennes réponses supprimées pour le dossier " + dossier.getId());



        for (SingleResponseDTO r : dto.getResponses()) {  // Parcours les réponses envoyées
            System.out.println("🟡 Traitement de la question ID = " + r.getQuestionId());

            Question question = questionRepository.findById(r.getQuestionId()).orElseThrow(() -> // Charge la question
                    new RuntimeException("Question introuvable ID=" + r.getQuestionId()));

            // ✅ Réponse à choix multiple
            if (r.getOptionIds() != null && !r.getOptionIds().isEmpty()) {  // Si au moins une option choisie
                for (Long optId : r.getOptionIds()) { // Pour chaque option cochée
                    Option opt = optionRepository.findById(optId).orElse(null); // Charge l’option (tolère null)
                    if (opt != null) {
                        Response response = Response.builder()  // Construit une entité Response
                                .user(user)
                                .form(Form.builder().id(dto.getFormId()).build()) // Référence formulaire par ID
                                .dossier(dossier) // Dossier concerné
                                .step(step)
                                .question(question)
                                .option(opt)
                                .value(null) // Pas de valeur texte pour un choix
                                .isValid(false) // Marque non validé (workflow ultérieur)
                                .pillar(pillar) // Pilier (peut être null)
                                .build();
                        responseRepository.save(response);  // Persiste la réponse
                        System.out.println("✅ Réponse multiple enregistrée : questionId=" + r.getQuestionId() + " | optionId=" + optId);
                    } else {
                        System.out.println("⚠️ Option introuvable ID=" + optId);
                    }
                }
            }

            // ✅ Réponse texte/numérique (ou UPLOAD avec value=URL)
            if ((r.getValue() != null && !r.getValue().isBlank()) || // Si valeur texte/numérique présente
                    ("UPLOAD".equalsIgnoreCase(question.getType().name()) && r.getValue() != null)) { // Ou type UPLOAD avec valeur (URL)
                Response response = Response.builder()
                        .user(user)
                        .form(Form.builder().id(dto.getFormId()).build())
                        .dossier(dossier)  // Dossier
                        .step(step)
                        .question(question)
                        .value(r.getValue())
                        .option(null)
                        .isValid(false)
                        .pillar(pillar)  // <-- ICI
                        .build();
                responseRepository.save(response);
                System.out.println("✅ Réponse texte enregistrée : questionId=" + r.getQuestionId() + " | valeur='" + r.getValue() + "'");
            }
        }
        // 💬 Enregistrement du commentaire admin si fourni
        if (dto.getComment() != null && !dto.getComment().isBlank()) { // S’il y a un commentaire

            saveAdminComment(dossier.getId(), step.getId(), dto.getComment(), userEmail); // Enregistre
        }

        System.out.println("✅✅ Toutes les réponses ont été enregistrées.");



    }


    //But : Vérifie si le pilier donné (economique, socio, etc.) contient des réponses pour l'étape 3.
    @Override
    public boolean isPillarCompleted(Long dossierId, String pillar) {
        // Supposons que le nom du champ "step" correspond à "step3" pour Auto-Eval
        List<Response> responses = responseRepository.findByDossierIdAndStepAndPillar(dossierId, "step3", pillar);
        return responses != null && !responses.isEmpty();
    }

    //But : Calcule le score de chaque pilier pour un dossier donné.
    //
    //Logique :
    //
    //Récupère toutes les réponses
    //
    //Regroupe les scores par pilier :
    //
    //Si réponse = option, récupère option.score
    //
    //Si texte/numérique, attribue un score
    @Override
    public Map<String, Object> calculatePillarScores(Long dossierId) { // Calcule scores par pilier
        List<Response> responses = responseRepository.findByDossierId(dossierId); // Toutes réponses du dossier

        Map<String, Integer> scoreMap = new HashMap<>(); // Somme des scores par pilier
        Map<String, Integer> maxScoreMap = new HashMap<>();
        Map<String, Object> result = new HashMap<>();

        for (Response r : responses) { // Parcourt les réponses
            String pillar = r.getPillar(); // Récupère le pilier
            if (pillar == null) continue; // Ignore si non renseigné

            int score = 0; // Score par défaut

            if (r.getOption() != null && r.getOption().getScore() != null) { // Si réponse par option scorée
                // Cas des options (RADIO, CHOIXMULTIPLE...)
                score = r.getOption().getScore(); // Utilise score de l’option
            }else if (r.getQuestion() != null && r.getValue() != null && !r.getValue().isEmpty()) { // Sinon, si valeur texte/numérique
                String type = r.getQuestion().getType().name();

                if ("TEXTE".equalsIgnoreCase(type)) { // Texte => +1
                    score = 1;
                } else if ("NUMERIQUE".equalsIgnoreCase(type)) {  // Numérique => valeur entière
                    try {
                        score = Integer.parseInt(r.getValue()); // Parse int
                    } catch (NumberFormatException e) {
                        score = 0;// Valeur invalide => 0
                    }
                }
            }


            scoreMap.merge(pillar, score, Integer::sum); // Ajoute au cumul du pilier
            maxScoreMap.put(pillar, 15); // Max fixe par pilier (à rendre dynamique plus tard)
        }

        // Construit la map résultat {pilier: {score, max, threshold}}
        for (String p : scoreMap.keySet()) { // Pour chaque pilier scoré
            Map<String, Integer> pData = new HashMap<>(); // Données du pilier
            pData.put("score", scoreMap.get(p)); // Score cumulé
            pData.put("max", maxScoreMap.getOrDefault(p, 15));
            pData.put("threshold", 9); // seuil fixe (à adapter si nécessaire)
            result.put(p.toLowerCase(), pData);  // Clé en minuscule (uniformisation)
        }

        return result;
    }

    //But : Permet à un administrateur de sauvegarder un commentaire sur un dossier à une étape spécifique.
    //
    //Étapes :
    //
    //Vérifie que l’utilisateur est un administrateur
    //
    //Vérifie l’existence du dossier et de l’étape
    //
    //Enregistre un objet ResponseAdmin avec le commentaire
    @Override
    public void saveAdminComment(Long dossierId, Long stepId, String comment, String adminEmail) {
        final String trimmed = (comment == null) ? "" : comment.trim();  // Normalise le texte (évite espaces seuls)

        User admin = userRepository.findByEmail(adminEmail) // Récupère l’utilisateur
                .orElseThrow(() -> new RuntimeException("Admin introuvable"));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("⚠️ Seuls les administrateurs peuvent enregistrer un commentaire.");
        }

        Dossier dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable"));

        Step step = stepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Étape introuvable"));

        // 🔁 Récupérer tous les commentaires existants pour ce dossier + étape
        List<ResponseAdmin> existingComments = responseAdminRepository.findByDossierIdAndStepId(dossierId, stepId);

        if (!existingComments.isEmpty()) {
            // ✏️ Mettre à jour le premier commentaire existant
            ResponseAdmin existingComment = existingComments.get(0);
            existingComment.setComment(comment);
            existingComment.setAdmin(admin); // Optionnel : mettre à jour l’auteur aussi
            responseAdminRepository.save(existingComment);
            System.out.println("✏️ Commentaire admin mis à jour pour le dossier ID=" + dossierId + ", étape ID=" + stepId);
        } else {
            // ➕ Créer un nouveau commentaire si aucun n’existe
            ResponseAdmin newComment = ResponseAdmin.builder()
                    .dossier(dossier)
                    .step(step)
                    .admin(admin)
                    .comment(comment)
                    .build();
            responseAdminRepository.save(newComment);
            System.out.println("✅ Commentaire admin créé pour le dossier ID=" + dossierId + ", étape ID=" + stepId);
        }

        // 3) Notification (seulement si on a vraiment un texte)
        try {
            notificationService.notifyStepComment(
                    dossier,
                    step,
                    "Commentaire de l’administrateur",
                    trimmed,
                    // si tes routes step existent, garde ceci; sinon remplace par "/projects/edit/" + dossier.getId()
                    "/projects/edit/" + dossier.getId() + "/step" + step.getId()
            );
        } catch (Exception ex) {
            // on log, mais on ne casse pas l’enregistrement du commentaire
            System.err.println("⚠️ Échec envoi notification commentaire admin : " + ex.getMessage());
        }


        // ... après responseAdminRepository.save(...)
        stepHistoryService.log(
                dossier, step, admin,
                existingComments.isEmpty()
                        ? StepHistory.StepHistoryAction.COMMENT_ADDED
                        : StepHistory.StepHistoryAction.COMMENT_UPDATED,
                trimmed,               // le texte du commentaire
                true                   // visible côté client
        );

    }

    @Override
    public String storeFileAndReturnUrl(MultipartFile file,
                                        Long questionId,
                                        Long dossierId,
                                        String email) {
        try {
            // 1) validations de base
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Fichier vide ou manquant.");
            }

            // 2) nom de fichier « safe »
            String original = Objects.requireNonNull(file.getOriginalFilename(), "originalFilename null");
            // retire toute éventuelle partie chemin + caractères douteux
            String baseName = Paths.get(StringUtils.cleanPath(original)).getFileName().toString()
                    .replaceAll("[\\r\\n\\\\/]+", "")      // pas de retours ligne / slash
                    .replaceAll("\\s+", "_");              // espaces -> _

            String filename = UUID.randomUUID() + "-" + baseName;

            // 3) base uploads + sous-dossier par dossierId (ou tmp)
            Path base = Paths.get("uploads").toAbsolutePath().normalize();
            Path dir  = base.resolve(dossierId != null ? dossierId.toString() : "tmp").normalize();

            Files.createDirectories(dir);

            // 4) chemin final normalisé + protection path-traversal
            Path target = dir.resolve(filename).normalize();
            if (!target.startsWith(base)) {
                throw new SecurityException("Chemin d'upload invalide.");
            }

            // 5) écrire le fichier
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            // 6) URL de retour (doit correspondre à ton ResourceHandler)
            return "/uploads/" + (dossierId != null ? dossierId + "/" : "tmp/") + filename;

        } catch (Exception e) {
            throw new RuntimeException("Échec upload fichier", e);
        }
    }


    @Override
    public Map<String, Integer> computeStep4Progress(Long dossierId) {
        final Long STEP_ID = 4L;
        final List<String>  pillars = List.of("PROFIL", "ENTREPRISE", "PROJET");

        Map<String, Integer> out = new LinkedHashMap<>();

        for (String p :  pillars) {
            long total = Optional.of(
                    questionRepository.countByStepIdAndPillar(STEP_ID, p)
            ).orElse(0);

            long answered = Optional.of(
                    responseRepository.countDistinctQuestionByDossierAndStepIdAndPillar(dossierId, STEP_ID, p)
            ).orElse(0);

            int percent = (total == 0) ? 0 : (int)Math.round(answered * 100.0 / total);
            out.put(p, Math.max(0, Math.min(100, percent)));
        }
        return out;
    }




}


//Cette classe implémente l'interface ResponseService. Elle contient la logique métier permettant de :
//
//créer, modifier et supprimer des réponses,
//
//gérer les réponses par étapes,
//
//calculer les scores,
//
//et enregistrer des commentaires administrateur.



//    @Override
//    public List<Response> findByDossierId(Long dossierId) {
//        return responseRepository.findByDossierId(dossierId);
//    }
//
//    @Override
//    public List<Response> findByUserId(Long userId) {
//        return responseRepository.findByUserId(userId);
//    }
