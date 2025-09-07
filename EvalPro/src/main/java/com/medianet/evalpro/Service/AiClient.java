package com.medianet.evalpro.Service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.medianet.evalpro.Configurations.AiProps;
import com.medianet.evalpro.Dto.FormSchema;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class AiClient {
    private final WebClient aiWebClient;
    private final AiProps props;
    private final ObjectMapper mapper = new ObjectMapper();

    public FormSchema generate(String description, String stepName) {
        var req = Map.of(
                "model", props.getModel(),
                "messages", List.of(
                        Map.of("role","system","content", SYSTEM_PROMPT),
                        Map.of("role","user","content", "Étape: " + stepName + "\nBesoins: " + description)
                ),
                // OpenAI : forcer JSON ; pour Ollama, ça sera ignoré (mais garde la consigne system)
                "response_format", Map.of("type","json_object")
        );

        String content = aiWebClient.post().uri("/chat/completions")
                .bodyValue(req)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(n -> n.at("/choices/0/message/content").asText())
                .block(Duration.ofSeconds(45));

        try {
            var schema = mapper.readValue(content, FormSchema.class);
            if (schema.getFields() == null) schema.setFields(List.of());
            // Defaults légers
            schema.getFields().forEach(f -> {
                if (f.getType() == null) f.setType("text");
                if (f.getRequired() == null) f.setRequired(false);
            });
            return schema;
        } catch (Exception e) {
            throw new RuntimeException("Réponse IA invalide", e);
        }
    }

    private static final String SYSTEM_PROMPT = """
  Tu génères des schémas de formulaires (français) pour une app de financement.
  Tu renvoies UNIQUEMENT un JSON strict au format:
  { "title": string, "fields": [ { "id": string, "label": string, "type": "text|textarea|number|date|select|checkbox", "required": boolean, "min"?: number, "max"?: number, "placeholder"?: string, "options"?: [string] } ] }
  Pas de commentaires ni de texte hors JSON. Labels courts et pro.
  """;
}
