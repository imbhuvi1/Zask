package com.zask.card.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int cardId;

    private int listId;

    private int boardId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private int position;

    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    private String status; // TO_DO, IN_PROGRESS, IN_REVIEW, DONE

    private LocalDateTime dueDate;

    private LocalDateTime startDate;

    private int assigneeId;

    private int createdById;

    private boolean isArchived;

    private String coverColor;
    private String coverSize; // TOP, FULL

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isArchived = false;
        if (this.priority == null) this.priority = "MEDIUM";
        if (this.status == null) this.status = "TO_DO";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}