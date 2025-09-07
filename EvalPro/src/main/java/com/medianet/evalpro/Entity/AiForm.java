package com.medianet.evalpro.Entity;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;

@Entity
@Table(name = "ai_form")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AiForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long stepId;
    private String title;
    @Column(columnDefinition="LONGTEXT")
    private String schemaJson;
    private LocalDateTime createdAt = LocalDateTime.now();
}
