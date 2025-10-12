// com.medianet.evalpro.Configurations.KeycloakBeans.java
package com.medianet.evalpro.Configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@Configuration

/**
 * KeycloakBeans:
 * Objet Fournir dynamiquement un JwtDecoder pour valider les tokens Keycloak
 * quand la configuration OAuth2 est présente (JWK Set ou Issuer), sinon ne rien activer.
 */

public class KeycloakBeans {
    // URL de l’issuer (ex: https://keycloak.example.com/realms/mon-realm)
    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String issuerUri;
    // URL du JWK Set (clés publiques pour vérifier signature JWT)
    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:}")
    private String jwkSetUri;

    /**
     * Expose un JwtDecoder si la config Keycloak est présente.
     * - Priorité au jwk-set-uri (validation directe via set de clés)
     * - Sinon, fallback sur issuer-uri (découverte auto via .well-known/openid-configuration)
     * - Si rien n’est défini : pas de bean => le Resource Server OAuth2 n’est pas activé.
     */

    @Bean
    //JwtDecoder (Spring Security) : Composant qui lit/valide un JWT, Vérifie signature
    public JwtDecoder jwtDecoder() {
        // Cas 1 : configuration explicite des clés publiques (JWK Set)
        if (jwkSetUri != null && !jwkSetUri.isBlank()) {//jwkSetUri: URL des clés publiques (JWK Set), Sert à vérifier la signature des JWT.
            return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        }
        // Cas 2 : découverte à partir de l’issuer (OpenID Provider Configuration)
        if (issuerUri != null && !issuerUri.isBlank()) { //issuerUri :  URL de l’émetteur (Identity Provider), Base pour la découverte OIDC(open Id connect)
            return NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
        }
        // Cas 3 : Keycloak non configuré → on n’expose pas de JwtDecoder
        return null;
    }
}
