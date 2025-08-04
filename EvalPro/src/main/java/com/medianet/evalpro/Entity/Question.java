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

    @Column(name = "pillar")
    private String pillar;

    @ManyToOne
    private Step step;

    // ✅ Champs de dépendance (parent)
    @Column(name = "parent_question_id")
    private Long parentQuestionId;

    @Column(name = "parent_option_id")
    private Long parentOptionId;


    public enum QuestionType {
        TEXTE, CHOIXMULTIPLE, NUMERIQUE ,  RADIO, SECTION_TITLE,SELECT , UPLOAD ,DATE
    }
}
