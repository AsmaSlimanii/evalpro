package com.medianet.evalpro.Controller;

import com.medianet.evalpro.Dto.*;
import com.medianet.evalpro.Entity.User;
import com.medianet.evalpro.Repository.UserRepository;
import com.medianet.evalpro.Service.AuthService;
import com.medianet.evalpro.Service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final com.medianet.evalpro.Repository.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final MailService mailService;


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email déjà utilisé");
        }

        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    @PostMapping("/reset-password/request")
    public ResponseEntity<String> requestResetJson(@RequestBody ResetRequestDto request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable.");
        }

        User user = optionalUser.get();

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        String link = "http://localhost:4200/nouveau-mot-de-passe?token=" + token;
        mailService.sendResetEmail(user.getEmail(), link);

        // ✅ C'est ici la ligne importante :
        return ResponseEntity.ok("Lien envoyé à votre adresse e-mail.");
    }




    @PostMapping("/reset-password/confirm")
    public ResponseEntity<String> confirmReset(@RequestBody ResetPasswordDto dto) {
        System.out.println("==== [RESET] Requête reçue ====");
        System.out.println("Token : " + dto.getToken());
        System.out.println("New Password : " + dto.getNewPassword());

        Optional<User> optionalUser = userRepository.findByResetToken(dto.getToken());

        if (optionalUser.isEmpty()) {
            System.out.println("Aucun utilisateur trouvé avec ce token");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lien invalide ou expiré.");
        }

        User user = optionalUser.get();
        System.out.println("Utilisateur trouvé : " + user.getEmail());

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lien expiré.");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        System.out.println("✅ Mot de passe réinitialisé avec succès");
        return ResponseEntity.ok("Mot de passe réinitialisé avec succès");
    }


    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        String email = principal.getName(); // récupère l’email depuis le token

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("Utilisateur non trouvé");
        }

        User user = optionalUser.get();
        return ResponseEntity.ok().body(Map.of("id", user.getId()));
    }
    //✅ Résultat attendu
    //Angular appelle AuthService.getCurrentUserId() ✅
    //
    //Le backend retourne l’id de l’utilisateur courant depuis le token ✅
    //
    //Le formulaire Pré-Identification est soumis sans erreur ✅
    //
    //Tu es redirigé vers /projects/create comme prévu ✅



}