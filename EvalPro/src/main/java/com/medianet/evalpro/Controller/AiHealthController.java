package com.medianet.evalpro.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiHealthController {

    private final @Qualifier("aiWebClient") WebClient aiWebClient;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        String body = aiWebClient.get()
                .uri(uriBuilder -> uriBuilder.path("/models").build()) // <— ABSOLU
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return ResponseEntity.ok(body);
    }
}
