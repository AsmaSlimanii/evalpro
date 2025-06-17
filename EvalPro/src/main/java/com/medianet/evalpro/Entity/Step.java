package com.medianet.evalpro.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "step")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Step {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @Column(name = "step_order") // évite le mot réservé "order"
    private Integer stepOrder;

    private boolean isCompleted;

    @ManyToOne
    @JoinColumn(name = "dossier_id")
    private Dossier dossier;

    @JsonManagedReference // Ajoutez cette annotation
    @OneToMany(mappedBy = "step", cascade = CascadeType.ALL)
    private List<Form> forms;


}
