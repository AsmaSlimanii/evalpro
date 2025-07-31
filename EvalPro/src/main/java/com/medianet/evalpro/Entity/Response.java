package com.medianet.evalpro.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


    @Entity
    @Table(name = "response")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class Response {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)

        private Long id;

        private String value;
        private boolean isValid;
//        private String comment;

        @ManyToOne
        @JoinColumn(name = "user_id")
        private User user;

        @ManyToOne
        @JoinColumn(name = "form_id")
        private Form form;

        @ManyToOne
        @JoinColumn(name = "dossier_id")
        private Dossier dossier;

        @ManyToOne
        @JoinColumn(name = "option_id")
        private Option option;

        @ManyToOne
        @JoinColumn(name = "question_id")
        private Question question;

        @ManyToOne
        @JoinColumn(name = "step_id")
        @JsonBackReference
        private Step step;
        @Column(name = "pillar")
        private String pillar;



    }
