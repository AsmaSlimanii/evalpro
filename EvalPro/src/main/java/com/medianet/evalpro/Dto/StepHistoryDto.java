package com.medianet.evalpro.Dto;

import com.medianet.evalpro.Entity.StepHistory;
import com.medianet.evalpro.Entity.User;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public record StepHistoryDto(
        Long id,
        String action,
        String description,
        LocalDateTime createdAt,
        SimpleUser actor,
        SimpleStep step
) {
    public record SimpleUser(Long id, String displayName, String email) {}
    public record SimpleStep(Long id, String name) {}

    public static StepHistoryDto of(StepHistory h) {
        return new StepHistoryDto(
                h.getId(),
                h.getAction() != null ? h.getAction().name() : null,
                h.getDescription(),
                h.getCreatedAt(),
                toSimpleUser(h.getActor()),
                h.getStep() == null ? null : new SimpleStep(h.getStep().getId(), safeStepName(h))
        );
    }

    private static SimpleUser toSimpleUser(User u) {
        if (u == null) return null;

        // Essaie d'abord fullName si le champ existe, sinon compose prenom + name,
        // sinon username, sinon email.
        String displayName =
                getIfExists(u, "getFullName") != null ? u.getFullName() :
                        joinIfNotBlank(u.getPrenom(), u.getName());

        if (isBlank(displayName)) displayName = u.getUsername();
        if (isBlank(displayName)) displayName = u.getEmail();

        return new SimpleUser(u.getId(), displayName, u.getEmail());
    }

    private static String safeStepName(StepHistory h) {
        try {
            var step = h.getStep();
            if (step == null) return null;
            // adapte ici selon ton entité Step : getName(), getTitle(), getLabel()...
            return step.getName();
        } catch (Exception e) {
            return null;
        }
    }

    // Helpers

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static String joinIfNotBlank(String... parts) {
        String joined = Stream.of(parts)
                .filter(p -> !isBlank(p))
                .collect(Collectors.joining(" "));
        return isBlank(joined) ? null : joined;
    }

    // renvoie la valeur du getter si la méthode existe, sinon null
    private static Object getIfExists(Object o, String method) {
        try {
            return o.getClass().getMethod(method).invoke(o);
        } catch (Exception ignore) {
            return null;
        }
    }
}
