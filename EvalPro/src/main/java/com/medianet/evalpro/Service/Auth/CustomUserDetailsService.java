package com.medianet.evalpro.Service.Auth;

import com.medianet.evalpro.Entity.User;
import com.medianet.evalpro.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
//RequiredArgsConstructor : pour créer automatiquement un constructeur avec tous les final.

public class CustomUserDetailsService  implements UserDetailsService {

    //Cela évite d’écrire manuellement un constructeur. Spring pourra injecter userRepository automatiquement.
    private final UserRepository userRepository;

    //UserDetailsService et UserDetails de Spring Security : c’est l’interface que Spring utilise pour charger les utilisateurs.
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User utilisateur = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec l'email: " + email));

        return new org.springframework.security.core.userdetails.User(
                utilisateur.getEmail(),
                utilisateur.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")) // <- ici
        );

    }




}





// Cette méthode loadUserByUsername est le cœur du service :
//
//Elle est appelée automatiquement par Spring Security quand un utilisateur tente de se connecter.
//
//Elle prend l’email (ou le username) comme paramètre.
//
//Elle appelle le UserRepository.findByEmail(email) pour trouver l’utilisateur dans la base de données.
//
//Si l’utilisateur est trouvé → il est retourné.
//
//Sinon → une exception UsernameNotFoundException est levée (Spring gère ça en renvoyant une erreur 401).





// but de cette classe
//classe CustomUserDetailsService, dans le cadre de l’authentification Spring Security.
// Elle joue un rôle clé dans le processus de connexion : elle permet à Spring de retrouver les informations de l'utilisateur à partir de son email.