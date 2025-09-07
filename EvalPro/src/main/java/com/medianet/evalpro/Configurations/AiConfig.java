package com.medianet.evalpro.Configurations;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiConfig {
    @Bean WebClient aiWebClient(AiProps p) {
        return WebClient.builder()
                .baseUrl(p.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + p.getApiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}

