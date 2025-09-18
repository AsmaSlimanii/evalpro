package com.medianet.evalpro.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;



@Entity
@Table(name = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private String name;
    private String prenom;
    private String birthdate;
    private String gender;
    private String phone;
    private String discovery;
    private String activation;

    @Column(unique = true)
    private String email;
    private String password;
    private String confirmPassword;
    @Column(name = "reset_token")
    private String resetToken;
    @Column(unique = true)
    private String username;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;
    @JsonProperty("role")
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.CLIENT; // Valeur par défaut

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference //pour éviter les boucles infinies :
    // Le champ dossiers sera bien présent en base de données,Mais il ne sera pas visible dans la réponse JSON envoyée à Postman ou Angular lors d’un GET.
    private List<Dossier> dossiers;


    @JsonProperty("fullName")
    @Transient
    public String getFullName() {
        String p = prenom == null ? "" : prenom.trim();
        String n = name   == null ? "" : name.trim();
        String composed = (p + " " + n).trim();
        if (!composed.isEmpty()) return composed;

        if (username != null && !username.isBlank()) return username;
        return email; // dernier fallback
    }

    public enum Role {
        ADMIN, CLIENT
    }



// Implémentation des méthodes requises par UserDetails

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }


    @Override
    public String getUsername() {
        return email; // Dans Spring Security, le username est généralement l'email
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }


}
