// AiClient.java
package com.medianet.evalpro.Service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medianet.evalpro.Dto.FormSchema;
import com.medianet.evalpro.Dto.OpenAiChatResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiClient {

    private final @Qualifier("aiWebClient") WebClient aiWebClient;

    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public FormSchema generate(String description, String stepName) {
        try {
            return callOpenAI(description, stepName);
        } catch (ResponseStatusException ex) {
            int sc = ex.getStatusCode().value();
            // ✅ Fallback gratuit si pas de crédits (429) ou clé invalide (401)
            if (sc == 401 || sc == 429) {
                return fallbackForm(stepName, description);
            }
            throw ex; // autres erreurs = on laisse remonter
        }
    }

    private FormSchema callOpenAI(String description, String stepName) {
        var body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system",
                                "content", "Tu génères STRICTEMENT un JSON valide correspondant au schéma de formulaire suivant: {\"title\": string, \"fields\": array}. Ne renvoie rien d'autre que du JSON."),
                        Map.of("role", "user",
                                "content", stepName + " :: " + description)
                )
        );

        OpenAiChatResponseDTO resp = aiWebClient.post()
                .uri(u -> u.path("/chat/completions").build())
                .bodyValue(body)
                .retrieve()
                .onStatus(s -> s.is4xxClientError() || s.is5xxServerError(), r ->
                        r.bodyToMono(String.class).map(msg -> {
                            int code = r.statusCode().value();
                            if (code == 401) return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OpenAI: invalid_api_key");
                            if (code == 429) return new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "OpenAI: insufficient_quota");
                            return new ResponseStatusException(
                                    HttpStatus.BAD_GATEWAY,
                                    "Erreur OpenAI (" + code + "): " + (msg.length() > 400 ? msg.substring(0, 400) + "..." : msg)
                            );
                        })
                )
                .bodyToMono(OpenAiChatResponseDTO.class)
                .block();

        return toFormSchema(resp);
    }

    private FormSchema toFormSchema(OpenAiChatResponseDTO r) {
        String content = (r != null && r.choices != null && !r.choices.isEmpty()
                && r.choices.get(0).message != null)
                ? r.choices.get(0).message.content
                : null;

        if (content == null || content.isBlank()) {
            return fallbackForm("Formulaire", "");
        }

        String json = content.trim();
        if (!json.startsWith("{")) {
            int i = json.indexOf('{');
            int j = json.lastIndexOf('}');
            if (i >= 0 && j > i) json = json.substring(i, j + 1);
        }

        try {
            return mapper.readValue(json, FormSchema.class);
        } catch (Exception e) {
            return fallbackForm("Formulaire", "");
        }
    }

    private FormSchema fallbackForm(String stepName, String description) {
        Map<String, Object> init = extractInitials(description); // titre/budget/categorie/description

        FormSchema fs = new FormSchema();
        fs.setTitle(stepName == null || stepName.isBlank() ? "Formulaire" : stepName);

        // titre
        FormSchema.Field f1 = new FormSchema.Field();
        f1.setName("titre");
        f1.setType("text");
        f1.setLabel("Titre du projet");
        f1.setRequired(true);
        f1.setValue(init.getOrDefault("titre", ""));

        // budget
        FormSchema.Field f2 = new FormSchema.Field();
        f2.setName("budget");
        f2.setType("number");
        f2.setLabel("Budget estimé");
        f2.setRequired(false);
        f2.setValue(init.get("budget")); // nombre (Long) ou null

        // catégorie
        // Dans AiClient.fallbackForm(...)
        FormSchema.Field f3 = new FormSchema.Field();
        f3.setName("categorie");
        f3.setType("select");
        f3.setLabel("Catégorie");
        f3.setRequired(false);

        List<String> options = List.of("Agricole", "Industrie", "Services", "Autre");
        f3.setOptions(options);

        String cat = (String) init.get("categorie");
        if (cat != null && options.contains(cat)) {
            f3.setValue(cat);
        } else {
            f3.setValue(null); // rien de pré-sélectionné
        }

// description
        FormSchema.Field f4 = new FormSchema.Field();
        f4.setName("description");
        f4.setType("textarea");
        f4.setLabel("Description");
        f4.setRequired(false);

// -> si l'utilisateur a réellement fourni une description, on la garde,
//    sinon on synthétise une phrase à partir de titre/budget/catégorie
        String descFromUser = asStr(init.get("description"));
        String auto = synthesizeDescription(stepName, init);
        f4.setValue((descFromUser != null && !descFromUser.isBlank()) ? descFromUser : auto);


        fs.setFields(List.of(f1, f2, f3, f4));
        return fs;
    }
    private static String asStr(Object o) {
        return (o == null) ? null : String.valueOf(o);
    }

    private static String formatMoney(long v) {
        // 20 000 000 (séparateur d'espace fines)
        return String.format("%,d", v).replace(',', ' ').replace('\u00A0', ' ');
    }

    private static String synthesizeDescription(String stepName, Map<String,Object> init) {
        String titre = asStr(init.get("titre"));
        Long   budget = (init.get("budget") instanceof Number) ? ((Number) init.get("budget")).longValue() : null;
        String cat  = asStr(init.get("categorie"));

        StringBuilder sb = new StringBuilder();

        // Titre / fallback sur le nom d'étape
        if (titre != null && !titre.isBlank()) sb.append("Projet ").append(titre);
        else if (stepName != null && !stepName.isBlank()) sb.append(stepName);
        else sb.append("Projet");

        // Catégorie (en minuscules pour la phrase)
        if (cat != null && !cat.isBlank()) {
            sb.append(" dans le domaine ").append(cat.toLowerCase());
        }

        // Budget
        if (budget != null && budget > 0) {
            sb.append(", budget estimé ").append(formatMoney(budget));
        }

        sb.append(".");
        return sb.toString();
    }

    /** Extraction tolérante : titre / budget / catégorie / description */
    private Map<String, Object> extractInitials(String raw) {
        Map<String, Object> out = new HashMap<>();
        if (raw == null) raw = "";
        String txt   = raw.trim();
        String lower = txt.toLowerCase();

        // Normalisation séparateurs
        // remplace NBSP et tab par espace
        txt = txt.replace('\u00A0', ' ').replace('\t', ' ');
        String[] lines = txt.split("\\R+"); // par lignes

        // ========= 1) Cas "entêtes sur ligne 1" + "valeurs sur ligne 2" =========
        if (lines.length >= 2 &&
                lines[0].matches("(?i).*nom\\s*du\\s*projet.*budget.*cat[ée]gorie.*")) {

            String[] vals = lines[1].split("\\s*,\\s*");
            if (vals.length >= 1 && !vals[0].isBlank()) {
                out.put("titre", vals[0].trim());
            }
            if (vals.length >= 2) {
                Long b = parseMoney(vals[1]);
                if (b != null && b > 0) out.put("budget", b);
            }
            if (vals.length >= 3) {
                String catToken = vals[2].toLowerCase();
                if (catToken.contains("agricol")) out.put("categorie", "Agricole");
                else if (catToken.contains("industri")) out.put("categorie", "Industrie");
                else if (catToken.contains("service") || catToken.contains("commerce")) out.put("categorie", "Services");
                else out.put("categorie", "Autre");
            }
            // description : reste de la 2e ligne ou de la 3e si présente
            if (vals.length >= 4 && !vals[3].isBlank()) {
                out.put("description", vals[3].trim());
            } else if (lines.length >= 3 && !lines[2].isBlank()) {
                out.put("description", lines[2].trim());
            }
            return out;
        }

        // ========= 2) Cas "ligne CSV simple" : Titre, Budget, Catégorie, ... ========
        // Exemple: "Evalpro, 20.000.000, domaine agricole, description courte"
        if (lines.length >= 1 && lines[0].contains(",")) {
            String[] vals = lines[0].split("\\s*,\\s*");
            if (vals.length >= 1 && !vals[0].isBlank()) {
                // éviter de prendre "budget" / "catégorie" comme titre
                if (!vals[0].matches("(?i)^(budget|budjet|cat[ée]gorie|description)\\b.*")) {
                    out.put("titre", vals[0].trim());
                }
            }
            if (vals.length >= 2) {
                Long b = parseMoney(vals[1]);
                if (b != null && b > 0) out.put("budget", b);
            }
            if (vals.length >= 3) {
                String catToken = vals[2].toLowerCase();
                if (catToken.contains("agricol")) out.put("categorie", "Agricole");
                else if (catToken.contains("industri")) out.put("categorie", "Industrie");
                else if (catToken.contains("service") || catToken.contains("commerce")) out.put("categorie", "Services");
                else out.put("categorie", "Autre");
            }
            if (vals.length >= 4 && !vals[3].isBlank()) {
                out.put("description", vals[3].trim());
            }
            // on ne fait pas "return" ici pour laisser le fallback enrichir si besoin,
            // mais tu peux faire "return out;" si tu préfères strict.
        }

        // ========= 3) Fallback: tes régex existants, sécurisés =========
        // TITRE après mot-clé "nom/titre du projet" (en évitant budget/catégorie/description)
        Matcher m1 = Pattern.compile(
                "(?i)(nom\\s+du\\s+projet|titre\\s+du\\s+projet|projet)\\s*[:=,-]?\\s*([\\p{L}0-9][\\p{L}0-9 ._\\-]{1,})"
        ).matcher(txt);
        if (m1.find()) {
            String cand = m1.group(2).trim();
            if (!cand.matches("(?i)^(budget|budjet|cat[ée]gorie|description)\\b.*")) {
                cand = cand.replaceFirst("(?i)\\s*(mon\\s+budget|budget|description|,|;|\\.|\\n).*$", "").trim();
                if (!cand.isBlank()) out.putIfAbsent("titre", cand);
            }
        } else {
            // "Mon projet <Titre ...>"
            Matcher m2 = Pattern.compile("(?i)mon\\s+projet\\s*[:=,-]?\\s*([\\p{L}0-9][\\p{L}0-9 ._\\-]{1,})").matcher(txt);
            if (m2.find()) {
                String cand = m2.group(1).trim();
                if (!cand.matches("(?i)^(budget|budjet|cat[ée]gorie|description)\\b.*")) {
                    cand = cand.replaceFirst("(?i)\\s*(mon\\s+budget|budget|description|,|;|\\.|\\n).*$", "").trim();
                    if (!cand.isBlank()) out.putIfAbsent("titre", cand);
                }
            }
        }

        // BUDGET avec mot-clé
        Matcher mb = Pattern.compile(
                "(?i)(budget|budjet|co[uû]t|montant|cost|price)[^0-9]{0,15}([0-9\\s.,\\u00A0]+)\\s*([kKmM]?)"
        ).matcher(txt);
        if (mb.find()) {
            Long b = parseMoney(mb.group(2) + mb.group(3));
            if (b != null && b > 0) out.putIfAbsent("budget", b);
        }

        // CATEGORIE
        if (lower.contains("agricol")) out.putIfAbsent("categorie", "Agricole");
        else if (lower.contains("industri")) out.putIfAbsent("categorie", "Industrie");
        else if (lower.contains("service") || lower.contains("commerce")) out.putIfAbsent("categorie", "Services");
        else if (lower.contains("autre")) out.putIfAbsent("categorie", "Autre");

        // DESCRIPTION
        Matcher md = Pattern.compile("(?i)description\\s*[:=,-]?\\s*(.+)").matcher(txt);
        if (md.find()) out.putIfAbsent("description", md.group(1).trim());
        else if (lower.contains("description courte")) out.putIfAbsent("description", "courte");
        else if (!txt.isBlank()) out.putIfAbsent("description", txt);

        return out;
    }

    /** Parse "20.000.000", "20 000 000", "20m", "20000k" -> Long */
    private static Long parseMoney(String token) {
        if (token == null) return null;
        String t = token.replace('\u00A0',' ').trim();
        Matcher simple = Pattern.compile("([0-9\\s.,]+)\\s*([kKmM]?)").matcher(t);
        if (!simple.find()) return null;
        String digits = simple.group(1).replaceAll("[\\s.,]", "");
        String mag    = Optional.ofNullable(simple.group(2)).orElse("");
        try {
            long val = Long.parseLong(digits);
            if (mag.equalsIgnoreCase("k")) val *= 1_000L;
            if (mag.equalsIgnoreCase("m")) val *= 1_000_000L;
            return val;
        } catch (Exception e) {
            return null;
        }
    }


}
