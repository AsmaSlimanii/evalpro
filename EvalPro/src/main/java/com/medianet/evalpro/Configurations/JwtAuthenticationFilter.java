package com.medianet.evalpro.Configurations;

import com.medianet.evalpro.Service.Auth.CustomUserDetailsService;
import com.medianet.evalpro.Util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@Component

/**
 * JwtAuthenticationFilter:
 * Objet Assurer l’authentification Spring Security à partir d’un JWT :
 * déléguer aux filtres OAuth2 si le token vient de Keycloak, sinon valider le JWT “maison”,
 * charger l’utilisateur et déposer l’Authentication dans le SecurityContext.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    //permet d’identifier les tokens émis par Keycloak (Resource Server OAuth2 actif)
    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String keycloakIssuerUri;
    //JwtAuthenticationFilter : Filtre Spring Security (JWT).
    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Chaîne de filtrage principale :
     * - Récupère le Bearer token
     * - Si déjà authentifié => laisse passer
     * - Si token Keycloak => laisse le Resource Server gérer
     * - Sinon, traite le JWT "maison": valide, extrait email, charge UserDetails, pose Authentication dans le SecurityContext
     */

    @Override
    //doFilterInternal: Point d’entrée du filtre par requête.
    protected void doFilterInternal(HttpServletRequest request,//HttpServletRequest:  Représente la requête HTTP côté serveur (Java).
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = parseJwt(request); // lit l’en-tête Authorization: Bearer XXX

            // Si une auth existe déjà (ex: Resource Server a déjà authentifié), ne rien refaire
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                filterChain.doFilter(request, response);
                return;
            }

            if (jwt != null) {
                // 1) Si c'est un token Keycloak -> on laisse passer (handled par Resource Server OAuth2)
                if (isKeycloakToken(jwt)) {
                    // Ne pas authentifier ici : BearerTokenAuthenticationFilter s'en charge
                    filterChain.doFilter(request, response);
                    return;
                }

                // 2) Sinon, on traite ton JWT "maison"
                if (jwtUtil.validateToken(jwt)) {
                    String email = jwtUtil.extractEmail(jwt);

                    // Charge l'utilisateur depuis la BDD
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    // S'assure que les autorités sont préfixées "ROLE_"
                    List<SimpleGrantedAuthority> authorities = userDetails.getAuthorities().stream()
                            .map(a -> {
                                String name = a.getAuthority();
                                return name.startsWith("ROLE_")
                                        ? new SimpleGrantedAuthority(name)
                                        : new SimpleGrantedAuthority("ROLE_" + name);
                            })
                            .toList();
                    // Construit l’Authentication et l’injecte dans le contexte
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    System.out.println("✅ Utilisateur authentifié (JWT maison) : " + email);
                    System.out.println("🛡️ Autorités effectives : " + authorities);
                }
            }
        } catch (Exception e) {
            // On journalise sans divulguer de détails sensibles
            System.err.println("❌ JwtAuthenticationFilter error: " + e.getMessage());
        }
        // Poursuit la chaîne de filtres quoi qu’il arrive
        filterChain.doFilter(request, response);
    }

    /** Extrait le token Bearer depuis l’en-tête Authorization */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
    /**
     * Heuristique simple pour détecter un token Keycloak:
     * - Décoder la partie payload (Base64URL) du JWT
     * - Vérifier si "iss" (issuer) == issuer-uri configuré
     * Si oui: on considère que le Resource Server OAuth2 gère l’auth.
     */

    private boolean isKeycloakToken(String token) {
        if (!StringUtils.hasText(keycloakIssuerUri)) return false;
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return false;

            // Decode payload (base64url)
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            String payloadJson = new String(decoded, StandardCharsets.UTF_8);

            // Keycloak met exactement issuer = issuer-uri
            // On tolère guillemets ou espaces éventuels
            return payloadJson.contains("\"iss\":\"" + keycloakIssuerUri + "\"")
                    || payloadJson.contains("\"iss\": \"" + keycloakIssuerUri + "\"");
        } catch (IllegalArgumentException e) {
            // Token mal formé
            return false;
        }
    }
}
