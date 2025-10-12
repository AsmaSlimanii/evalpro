package com.medianet.evalpro.Configurations;

import com.medianet.evalpro.Service.Auth.CustomUserDetailsService;
import com.medianet.evalpro.Util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.*;

/**
 * SecurityConfig :
 * Objet Centraliser la sécurité HTTP : CORS, stateless, règles d’autorisation par endpoint,
 * prise en charge Keycloak (OAuth2 Resource Server) si configuré, et fallback JWT “maison”
 * via JwtAuthenticationFilter.
 */

@RequiredArgsConstructor
@Configuration
@EnableMethodSecurity // Active la sécurité au niveau méthodes (ex: @PreAuthorize("hasRole('ADMIN')"))
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final JwtAuthenticationFilter jwtAuthenticationFilter; // filtre JWT maison

    // Valeurs lues depuis application.yml (peuvent être vides)
    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:}")
    private String jwkSetUri;

    /** Chaîne de filtres HTTP principale (autorisations, CORS, CSRF, stateless, OAuth2 RS, filtres JWT) */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                //CSRF = Cross-Site Request Forgery
                //Protection : jeton CSRF (token) unique par session.
                // APIs JWT → pas de CSRF
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(request -> {
                    var c = new org.springframework.web.cors.CorsConfiguration();
                    c.setAllowedOrigins(List.of("http://localhost:4200"));
                    c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
                    c.setAllowedHeaders(List.of("Authorization","Content-Type","Accept","Origin","X-Requested-With"));
                    c.setAllowCredentials(true);
                    return c;
                }))
                // Stateless (pas de session serveur)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Règles d’accès par endpoint
                .authorizeHttpRequests(auth -> auth
                        // Pré-vol CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Auth & formulaires publics (ex: inscription/login, chargement de métadonnées)
                        .requestMatchers("/api/auth/**").permitAll()  //requestMatchers:  Sélecteurs d’URL/req. pour appliquer des règles.
                        .requestMatchers("/api/forms/**").permitAll() //permitAll: Autorise tout le monde.
                        .requestMatchers("/api/users/**").permitAll()
                        .requestMatchers("/api/responses/**").permitAll()
                        .requestMatchers("/api/responses/progress/**").permitAll()
                        .requestMatchers("/api/responses/step3-pillar-progress/**").permitAll()
                        .requestMatchers("/api/responses/step4-pillar-progress/**").permitAll()
                        // Notifications
                        .requestMatchers("/api/notifications/**").hasAnyRole("CLIENT","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/notifications/**").authenticated()
                        // Dossiers
                        .requestMatchers(HttpMethod.POST, "/api/dossiers/*/submit").hasAnyRole("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/dossiers/drafts").hasAnyRole("CLIENT")
                        .requestMatchers("/api/dossiers/**").hasAnyRole("CLIENT","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/dossiers").hasAnyRole("CLIENT","ADMIN")
                        // Admin
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // IA
                        .requestMatchers("/api/ai/**").hasAnyRole("ADMIN","CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/ai/forms/generate").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/ai/forms").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/ai/**").permitAll()
                        // Historique
                        .requestMatchers(HttpMethod.GET, "/api/history/**").hasAnyRole("ADMIN","CLIENT")
                        // Tout le reste → authentifié
                        .anyRequest().authenticated()
                );

        // ✅ Active Keycloak UNIQUEMENT si une config est présente
        //keycloak : Gère SSO, login, logout.
        if (hasText(jwkSetUri) || hasText(issuerUri)) {
            JwtDecoder decoder = hasText(jwkSetUri)
                    ? NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build()  // vérif via JWK set
                    : NimbusJwtDecoder.withIssuerLocation(issuerUri).build(); // découverte via issuer
            //HTTP (HyperText Transfer Protocol): Protocole de communication web.
            //OAuth2 = Open Authorization 2.0
            //➡️ C’est la 2ᵉ version du protocole Open Authorization,
            //utilisé pour donner un accès sécurisé à des ressources sans partager le mot de passe.
            http.oauth2ResourceServer(oauth -> oauth //OAuth2 : Standard d’autorisation (pas d’authentification).
                    .jwt(jwt -> jwt
                            .decoder(decoder)
                            .jwtAuthenticationConverter(this::keycloakJwtToAuthToken) // mappe rôles Keycloak -> ROLE_*
                    )
            );
        }

        // ✅ Toujours ajouter le filtre JWT “maison” AVANT le filtre Bearer OAuth2 (fallback)
        http.addFilterBefore(jwtAuthenticationFilter,BearerTokenAuthenticationFilter.class);

        return http.build();
    }
    /** utilitaire local */
    private boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    /**
     * Convertit un JWT Keycloak en Authentication Spring avec authorities “ROLE_*”.
     * - Lit realm_access.roles et resource_access[client].roles
     * - Préfixe systématiquement ROLE_
     */
    //JwtAuthenticationToken : Classe de Spring Security,Représente un utilisateur authentifié via JWT.
    //keycloakJwtToAuthToken: Convertisseur custom, Transforme un JWT Keycloak
    private JwtAuthenticationToken keycloakJwtToAuthToken(Jwt jwt) {
        //Collection<GrantedAuthority>: Type Java (collection d’autorisations), Contient des rôles/permissions de l’utilisateur.
        Collection<GrantedAuthority> auths = new ArrayList<>();
        //realmAccess: Objet dans le JWT, Liste les rôles du realm.
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null) {
            Object rolesObj = realmAccess.get("roles");
            if (rolesObj instanceof Collection<?> roles) {
                roles.stream().filter(Objects::nonNull)
                        .map(Object::toString)
                        .forEach(r -> auths.add(new SimpleGrantedAuthority("ROLE_" + r)));
            }
        }

        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess != null) {
            resourceAccess.values().forEach(v -> {
                if (v instanceof Map<?, ?> clientMap) {
                    Object rolesObj = clientMap.get("roles");
                    if (rolesObj instanceof Collection<?> roles) {
                        roles.stream().filter(Objects::nonNull)
                                .map(Object::toString)
                                .forEach(r -> auths.add(new SimpleGrantedAuthority("ROLE_" + r)));
                    }
                }
            });
        }

        return new JwtAuthenticationToken(jwt, auths, jwt.getSubject());
    }
    /** Auth manager pour l’endpoint /login (si utilisé) basé sur UserDetailsService + BCrypt */
    @Bean
    public AuthenticationManager authenticationManager() {//authenticationManager: Composant qui authentifie une requête.
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(authProvider);
    }
    /** Encodeur de mots de passe (stockage + vérification) */
    @Bean
    //passwordEncoder : Hache les mots de passe.
    //BCryptPasswordEncoder : Encodeur de mots de passe BCrypt.
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
