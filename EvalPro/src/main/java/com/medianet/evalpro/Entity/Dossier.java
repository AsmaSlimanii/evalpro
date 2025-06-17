package com.medianet.evalpro.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "dossier")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dossier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private Status status;


    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference //pour éviter les boucles infinies
    private User user;

    @OneToMany(mappedBy = "dossier" , cascade = CascadeType.ALL)
    private List<Step> steps;
    private String nomOfficielProjet;



    public enum Status {
        EN_COURS, VALIDE, REJETE
    }
}