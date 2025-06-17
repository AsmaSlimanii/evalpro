package com.medianet.evalpro.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@Table(name = "question")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
    public class Question {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String text;
        public String description;

        public boolean isRequired;

        @Enumerated(EnumType.STRING)
        private QuestionType type;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
        private List<Option> options;

        @ManyToMany(mappedBy = "questions")
        private List<Form> forms;



    public enum QuestionType {
                TEXTE, CHOIXMULTIPLE, NUMERIQUE
        }
}
