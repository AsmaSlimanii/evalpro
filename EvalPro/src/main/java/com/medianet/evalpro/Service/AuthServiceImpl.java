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

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

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
        //

        userRepository.save(user);

        // 🔐 Ajout du rôle dans le token JWT
        List<String> roles = List.of("ROLE_" + user.getRole().name());
        // ou ROLE_ADMIN selon le rôle réel
        String token = jwtUtil.generateToken(user.getEmail(), roles);

        return new AuthResponse(token, "Inscription réussie !");
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email non trouvé."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe invalide.");
        }

        // 🔐 Ajout du rôle dans le token JWT
        List<String> roles = List.of("ROLE_USER"); // ou récupérer depuis user.getRole()
        String token = jwtUtil.generateToken(user.getEmail(), roles);

        return new AuthResponse(token, "Connexion réussie !");
    }
}
