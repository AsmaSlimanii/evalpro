package com.medianet.evalpro.Dto;

import com.medianet.evalpro.Entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private Notification.Type type;
    private String link;
    private boolean readFlag;
    private LocalDateTime createdAt;
    private Long dossierId;
    private Long stepId;

    public static NotificationDTO from(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .link(n.getLink())
                .readFlag(Boolean.TRUE.equals(n.getReadFlag()))
                .createdAt(n.getCreatedAt())
                .dossierId(n.getDossier() != null ? n.getDossier().getId() : null)
                .stepId(n.getStep() != null ? n.getStep().getId() : null)
                .build();
    }
}
