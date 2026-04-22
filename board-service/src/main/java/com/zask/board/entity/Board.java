package com.zask.board.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "boards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int boardId;

    private int workspaceId;

    private String name;

    private String description;

    private String background;

    private String visibility; // PUBLIC or PRIVATE

    private int createdById;

    private boolean isClosed;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.visibility == null) this.visibility = "PRIVATE";
        this.isClosed = false;
    }
}