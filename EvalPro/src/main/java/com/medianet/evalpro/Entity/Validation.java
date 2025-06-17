package com.medianet.evalpro.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "validation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Validation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String comment;

    @Enumerated(EnumType.STRING)
    private Status status;


    @ManyToOne
    @JoinColumn(name = "response_id")
    private Response reponse;

    @ManyToOne
    @JoinColumn(name = "validator_id")
    private Admin validator;



    public enum Status {
        VALIDE, REJETE
    }
}
