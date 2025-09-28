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
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    /**
     * On lit la valeur de spring.security.oauth2.resourceserver.jwt.issuer-uri (Keycloak)
     * pour reconnaître les tokens Keycloak et les laisser au Resource Server.
     */
    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String keycloakIssuerUri;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = parseJwt(request);

            // Rien à faire si déjà authentifié (par ex. par le Resource Server)
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

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    System.out.println("✅ Utilisateur authentifié (JWT maison) : " + email);
                    System.out.println("🛡️ Autorités effectives : " + authorities);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ JwtAuthenticationFilter error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    /**
     * Détection simple d’un token Keycloak via le claim "iss" du payload JWT.
     * On évite un parsing JSON complet : un check texte suffit ici.
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
