package com.medianet.evalpro.Configurations;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;

import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
// import reactor.netty.transport.ProxyProvider; // <- décommente si proxy d'entreprise requis
import io.netty.channel.ChannelOption;

import java.time.Duration;

@Slf4j   // Logger via Lombok (@Slf4j)
@Configuration

/**
 * AiConfig:
 * Objet de “AiConfig centralise la configuration réseau et sécurité et expose un WebClient prêt pour l’IA,
 * afin que le code métier n’ait qu’à fournir le model et le prompt.”
 */
public class AiConfig {

    // ---------- Utilitaires/contraintes (précompilés) ----------
    private static final java.util.regex.Pattern SPLIT_LINES =
            java.util.regex.Pattern.compile("\\R+"); // Séparer le texte en lignes

    private static final java.util.regex.Pattern CSV_SPLIT =
            java.util.regex.Pattern.compile("\\s*,\\s*");  // Séparateur CSV (CSV = Comma-Separated Values) Format de fichier texte pour les données tabulaires.

    private static final java.util.regex.Pattern HEADER_LINE =
            // Détection de mots-clés attendus sur une "ligne d'en-tête" (insensible à la casse)
            java.util.regex.Pattern.compile("(?i)\\b(nom|sdu|projet|titre|budget|cat(?:é|e)gorie|description)\\b");

    private static final java.util.regex.Pattern CLEAN_TOKENS =
            // Nettoie les préfixes type "nom: ", "budget - ", "catégorie : ".
            java.util.regex.Pattern.compile("(?i)^(?:nom|sdu|projet|titre|budget|cat(?:é|e)gorie|description)\\s*[:\\-–]?\\s*");

    //  Borne anti-DoS(anti-DoS = protections contre les attaques de déni de service,
    //  Objectif : garder le service disponible): on limite la taille des contenus traités
    private static final int MAX_TEXT = 5000;

    /** Filtre de log "safe" : logge méthode/URL/en-têtes NON sensibles (jamais l'Authorization) */
    private static ExchangeFilterFunction logFilter() {
        return ExchangeFilterFunction.ofRequestProcessor(req -> {
            System.out.println("[AI] -> " + req.method() + " " + req.url());
            req.headers().forEach((k, v) -> {
                if (!k.equalsIgnoreCase("Authorization")) {
                    System.out.println("[AI] H " + k + ": " + v);
                }
            });
            return Mono.just(req); // on relaisse passer la requête
        });
    }

    /** Sanitize de la clé API : supprime BOM/espaces/retours pour éviter des 401 surprenantes */
    private static String sanitizeKey(String raw) { //sanitizeKey: Fonction pour nettoyer/normaliser une clé (champ, header, map), But : éviter caractères interdits, injections, erreurs format.
        if (raw == null) return "";
        return raw
                .replace("\uFEFF", "")// Byte-Order-Mark éventuel
                .replaceAll("\\s+", "") // Tous espaces/retours/tabulations
                .trim();
    }
    /** Fabrique le WebClient spécialisé IA, injectable via @Qualifier("aiWebClient") */
    @Bean(name = "aiWebClient")
    public WebClient aiWebClient(AiProps p) {//aiWebClient: Objet pour faire des appels HTTP asynchrones, Fait partie du module Spring WebFlux.

        // ---- Base URL normalisée (garantir .../v1) ----
        String base = (p.getBaseUrl() == null ? "" : p.getBaseUrl().trim());
        if (base.isEmpty()) base = "https://api.openai.com/v1"; // valeur par défaut
        while (base.endsWith("/")) {   // retire les '/' de fin
            base = base.substring(0, base.length() - 1);
        }

        if (!base.endsWith("/v1")) base = base + "/v1";  // s'assure du suffixe /v1


        // ---- Clé API : nettoyage + validation "fail fast" ----
        String key = sanitizeKey(p.getApiKey());
        if (!StringUtils.hasText(key) || !key.startsWith("sk-") || key.length() < 30) {
            throw new IllegalStateException(
                    "Clé OpenAI invalide ou vide. Vérifie qu'elle commence par 'sk-' et qu'elle est complète."
            );
        }
        // Petit aperçu masqué pour les logs (sécurité)
        String preview = key.substring(0, Math.min(4, key.length()))
                + "..." +
                key.substring(Math.max(0, key.length() - 4));
        log.info("OpenAI baseUrl={}, model={}, apiKeyLen={}, apiKeyPreview={}",
                base, p.getModel(), key.length(), preview);

        // ---- Client HTTP Reactor Netty : timeouts réseau (robustesse) ----
        HttpClient http = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)    // Timeout de connexion (10s)
                .responseTimeout(Duration.ofSeconds(30));                // Timeout de réponse (30s)

        // ---- Construction du WebClient dédié IA ----
        return WebClient.builder()
                .baseUrl(base) // baseUrl: URL de base pour les requêtes HTTP, Évite de répéter la même partie dans chaque appel.
                .clientConnector(new ReactorClientHttpConnector(http)) //Permet de régler timeouts, timeouts/proxy appliqués
                .filter(logFilter())  // logs non sensibles
                .defaultHeaders(h -> {  // En-têtes par défaut
                    h.setBearerAuth(key);                       // Authorization: Bearer <clé>
                    h.setContentType(MediaType.APPLICATION_JSON);
                    h.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
                })
                // Evite DataBufferLimitException : on augmente la mémoire max pour le JSON
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(c -> c.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                        .build())
                .build();
    }
}
