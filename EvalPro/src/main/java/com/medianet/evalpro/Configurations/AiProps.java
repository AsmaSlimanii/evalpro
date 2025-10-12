package com.medianet.evalpro.Configurations;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;



/**
 * AiProps:
 * Objet de configuration pour centraliser les paramètres IA.
 * Les valeurs sont injectées depuis application.properties via le préfixe "ai".
 */
@Data
@Component // Enregistre ce POJO comme bean Spring (disponible à l'injection)
@ConfigurationProperties(prefix = "ai") // Lie les clés "ai.*" aux champs ci-dessous
public class AiProps {
    @NotBlank // Validation : doit être non vide au démarrage, sinon erreur
    private String baseUrl;  // URL de base de l’API IA (ex: https://api.openai.com/v1)
    @NotBlank
    private String apiKey; // Clé API lue depuis l'env (ex: OPENAI_API_KEY), jamais commitée
    @NotBlank
    private String model; // Nom du modèle IA utilisé par les requêtes (chat/completions, etc.)
}

