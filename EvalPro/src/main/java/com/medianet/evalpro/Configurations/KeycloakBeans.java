// com.medianet.evalpro.Configurations.KeycloakBeans.java
package com.medianet.evalpro.Configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@Configuration
public class KeycloakBeans {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:}")
    private String jwkSetUri;

    @Bean
    public JwtDecoder jwtDecoder() {
        // Si aucune propriété n’est renseignée, on renvoie null → bean absent
        if (jwkSetUri != null && !jwkSetUri.isBlank()) {
            return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        }
        if (issuerUri != null && !issuerUri.isBlank()) {
            return NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
        }
        return null; // pas de Keycloak → pas de JwtDecoder
    }
}
