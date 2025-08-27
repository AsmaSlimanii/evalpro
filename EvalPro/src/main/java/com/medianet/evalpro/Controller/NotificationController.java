package com.medianet.evalpro.Controller;

import com.medianet.evalpro.Dto.NotificationDTO;
import com.medianet.evalpro.Repository.NotificationRepository;
import com.medianet.evalpro.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    @Transactional
    @PostMapping("/{id}/read")
    public void markRead(@PathVariable Long id, Authentication auth) {
        Long userId = currentUserId(auth);
        repo.markAsRead(id, userId);
    }
    @Transactional
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
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOne(@PathVariable Long id, Authentication auth) {
        Long userId = currentUserId(auth);
        repo.deleteByIdAndUserId(id, userId);
        return ResponseEntity.noContent().build();
    }
    @Transactional
    @DeleteMapping
    public ResponseEntity<Void> deleteAll(Authentication auth) {
        Long userId = currentUserId(auth);
        repo.deleteAllByUserId(userId);
        return ResponseEntity.noContent().build();
    }

}
