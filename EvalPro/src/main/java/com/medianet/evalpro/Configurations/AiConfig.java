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

@Slf4j
@Configuration
public class AiConfig {

    /** Log non sensible : méthode, URL, en-têtes (sans Authorization) */
    private static ExchangeFilterFunction logFilter() {
        return ExchangeFilterFunction.ofRequestProcessor(req -> {
            System.out.println("[AI] -> " + req.method() + " " + req.url());
            req.headers().forEach((k, v) -> {
                if (!k.equalsIgnoreCase("Authorization")) {
                    System.out.println("[AI] H " + k + ": " + v);
                }
            });
            return Mono.just(req);
        });
    }

    /** Nettoie la clé : supprime BOM/espaces/retours */
    private static String sanitizeKey(String raw) {
        if (raw == null) return "";
        return raw
                .replace("\uFEFF", "")     // BOM éventuel
                .replaceAll("\\s+", "")    // tous espaces/retours
                .trim();
    }

    @Bean(name = "aiWebClient")
    public WebClient aiWebClient(AiProps p) {
        // 1) Normaliser baseUrl et garantir .../v1
        String base = (p.getBaseUrl() == null ? "" : p.getBaseUrl().trim());
        if (base.isEmpty()) base = "https://api.openai.com/v1";
        base = base.replaceAll("/+$", ""); // supprime les / finaux
        if (!base.endsWith("/v1")) base = base + "/v1";

        // 2) Clé API obligatoire + sanitization
        String key = sanitizeKey(p.getApiKey());
        if (!StringUtils.hasText(key) || !key.startsWith("sk-") || key.length() < 30) {
            throw new IllegalStateException(
                    "Clé OpenAI invalide ou vide. Vérifie qu'elle commence par 'sk-' et qu'elle est complète."
            );
        }
        String preview = key.substring(0, Math.min(4, key.length()))
                + "..." +
                key.substring(Math.max(0, key.length() - 4));
        log.info("OpenAI baseUrl={}, model={}, apiKeyLen={}, apiKeyPreview={}",
                base, p.getModel(), key.length(), preview);

        // 3) HttpClient + timeouts (sans proxy explicite)
        HttpClient http = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)   // 10s
                .responseTimeout(Duration.ofSeconds(30));               // 30s

        // -- Si ton réseau impose un proxy d’entreprise, utilise ce bloc :
        // HttpClient http = HttpClient.create()
        //     .proxy(spec -> spec
        //         .type(ProxyProvider.Proxy.HTTP)
        //         .host("proxy.entreprise.local")
        //         .port(8080)
        //         // .username("user").password(s -> "secret") // si besoin
        //     )
        //     .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
        //     .responseTimeout(Duration.ofSeconds(30));

        return WebClient.builder()
                .baseUrl(base) // ex. https://api.openai.com/v1
                .clientConnector(new ReactorClientHttpConnector(http))
                .filter(logFilter())
                .defaultHeaders(h -> {
                    h.setBearerAuth(key);                       // Authorization: Bearer <clé>
                    h.setContentType(MediaType.APPLICATION_JSON);
                    h.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
                })
                // éviter DataBufferLimitException sur réponses JSON plus grosses
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(c -> c.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                        .build())
                .build();
    }
}
