package com.medianet.evalpro.Service;

import com.medianet.evalpro.Dto.AuthRequest;
import com.medianet.evalpro.Dto.AuthResponse;
import com.medianet.evalpro.Dto.RegisterRequest;
import com.medianet.evalpro.Entity.User;
import com.medianet.evalpro.Repository.UserRepository;
import com.medianet.evalpro.Util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService{

    //userRepository : pour enregistrer ou chercher un utilisateur.
    //
    //passwordEncoder : pour encoder les mots de passe en Bcrypt.
    //
    //jwtUtil : pour générer des tokens JWT.
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .birthdate(request.getBirthdate())
                .gender(request.getGender())
                .phone(request.getPhone())
                .discovery(request.getDiscovery())
                .activation(request.getActivation())
                .role(request.getRole() != null ? request.getRole() : User.Role.CLIENT)
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, "Inscription réussie !");
    }

    //Explication :
    //cherches un utilisateur par email.
    //
    //Si l’email n’existe pas → exception : "User not found".
    //
    //compares le mot de passe envoyé avec le mot de passe encodé en base.
    //
    //Si ça ne correspond pas → exception : "Invalid password".
    //
    //Si tout est bon :
    //
    //génères un token JWT.
    //
    //le retournes dans un objet AuthResponse.
    //
    //Résultat : si les identifiants sont valides, le backend renvoie un JWT au client.

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email non trouvé."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe invalide.");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, "Connexion réussie !");

    }
}
