package com.zask.label.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

@Entity
@Table(name = "checklist_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int itemId;

    private int checklistId;

    private String text;

    @JsonProperty("isCompleted")
    private boolean isCompleted;


    private int assigneeId;

    private LocalDate dueDate;

    @PrePersist
    public void prePersist() {
        this.isCompleted = false;
    }
}