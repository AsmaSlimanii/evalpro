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
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.*;

@RequiredArgsConstructor
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final JwtAuthenticationFilter jwtAuthenticationFilter; // ton filtre JWT maison

    // ⚙️ Valeurs lues depuis application.yml (peuvent être vides)
    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:}")
    private String jwkSetUri;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(request -> {
                    var c = new org.springframework.web.cors.CorsConfiguration();
                    c.setAllowedOrigins(List.of("http://localhost:4200"));
                    c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
                    c.setAllowedHeaders(List.of("Authorization","Content-Type","Accept","Origin","X-Requested-With"));
                    c.setAllowCredentials(true);
                    return c;
                }))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/forms/**").permitAll()
                        .requestMatchers("/api/users/**").permitAll()
                        .requestMatchers("/api/responses/**").permitAll()
                        .requestMatchers("/api/responses/progress/**").permitAll()
                        .requestMatchers("/api/responses/step3-pillar-progress/**").permitAll()
                        .requestMatchers("/api/responses/step4-pillar-progress/**").permitAll()

                        .requestMatchers("/api/notifications/**").hasAnyRole("CLIENT","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/notifications/**").authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/dossiers/*/submit").hasAnyRole("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/dossiers/drafts").hasAnyRole("CLIENT")
                        .requestMatchers("/api/dossiers/**").hasAnyRole("CLIENT","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/dossiers").hasAnyRole("CLIENT","ADMIN")

                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/ai/**").hasAnyRole("ADMIN","CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/ai/forms/generate").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/ai/forms").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/ai/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/history/**").hasAnyRole("ADMIN","CLIENT")

                        .anyRequest().authenticated()
                );

        // ✅ Active Keycloak UNIQUEMENT si une config est présente
        if (hasText(jwkSetUri) || hasText(issuerUri)) {
            JwtDecoder decoder = hasText(jwkSetUri)
                    ? NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build()
                    : NimbusJwtDecoder.withIssuerLocation(issuerUri).build();

            http.oauth2ResourceServer(oauth -> oauth
                    .jwt(jwt -> jwt
                            .decoder(decoder)
                            .jwtAuthenticationConverter(this::keycloakJwtToAuthToken)
                    )
            );
        }

        // ✅ Toujours ton filtre JWT "maison" en fallback
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    // Mapper des rôles Keycloak -> ROLE_*
    private JwtAuthenticationToken keycloakJwtToAuthToken(Jwt jwt) {
        Collection<GrantedAuthority> auths = new ArrayList<>();

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

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(authProvider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
