package com.zask.list.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_lists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int listId;

    private int boardId;

    private String name;

    private int position;

    private String color;

    private boolean isArchived;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isArchived = false;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}