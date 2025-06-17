package com.medianet.evalpro.Controller;
import com.medianet.evalpro.Entity.User;
import com.medianet.evalpro.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

    @RestController
    @RequestMapping("/api")
    @RequiredArgsConstructor
    public class AuthenticatedUserController {

        private final UserRepository userRepository;

        @GetMapping("/current-user")
        public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) {
                return ResponseEntity.status(401).body("Non authentifié");
            }

            Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Utilisateur introuvable");
            }

            return ResponseEntity.ok().body(new Object() {
                public final Long id = userOpt.get().getId();
            });
        }
    }


