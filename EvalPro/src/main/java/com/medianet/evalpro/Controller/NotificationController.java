package com.medianet.evalpro.Controller;

import com.medianet.evalpro.Dto.NotificationDTO;
import com.medianet.evalpro.Repository.NotificationRepository;
import com.medianet.evalpro.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository repo;
    private final UserRepository userRepo;

    @GetMapping
    public List<NotificationDTO> list(Authentication auth) {
        Long userId = currentUserId(auth);
        return repo.findTop20ByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationDTO::from).toList();
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication auth) {
        Long userId = currentUserId(auth);
        long c = repo.countByUserIdAndReadFlagFalse(userId);
        return Map.of("count", c);
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable Long id, Authentication auth) {
        Long userId = currentUserId(auth);
        repo.markAsRead(id, userId);
    }

    @PostMapping("/read-all")
    public void markAll(Authentication auth) {
        Long userId = currentUserId(auth);
        repo.markAllAsRead(userId);
    }

    private Long currentUserId(Authentication auth) {
        return userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"))
                .getId();
    }
}
