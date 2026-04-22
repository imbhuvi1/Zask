package com.zask.label.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "checklists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Checklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int checklistId;

    private int cardId;

    private String title;

    private int position;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}