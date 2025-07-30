package com.medianet.evalpro.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseAdmin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Dossier dossier;

    @ManyToOne
    private Step step;

    @ManyToOne
    private User admin;

    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
}
