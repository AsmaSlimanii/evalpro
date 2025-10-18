package com.medianet.evalpro.Controller;

import com.medianet.evalpro.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
class MeController {
    private final UserRepository users;

    @GetMapping("/api/me")
    public Map<String,Object> me(Authentication auth) {
        var u = users.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return Map.of("id", u.getId(), "email", u.getEmail());
    }
}