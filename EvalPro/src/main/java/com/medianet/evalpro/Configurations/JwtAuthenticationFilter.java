package com.medianet.evalpro.Configurations;

import com.medianet.evalpro.Service.Auth.CustomUserDetailsService;
import com.medianet.evalpro.Util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

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

            if (jwt != null && jwtUtil.validateToken(jwt) &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                // 1) Email depuis le token
                String email = jwtUtil.extractEmail(jwt);

                // 2) Charge l'utilisateur depuis la BDD (source de vérité)
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // ⚠️ IMPORTANT : s’assurer que CustomUserDetailsService renvoie bien des autorités
                // préfixées ROLE_ (ex: ROLE_CLIENT, ROLE_ADMIN). Si besoin, recrée-les ici :
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

                System.out.println("✅ Utilisateur authentifié : " + email);
                System.out.println("🛡️ Autorités effectives : " + authorities);
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
}