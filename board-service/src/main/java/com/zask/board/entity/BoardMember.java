package com.zask.board.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "board_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int boardMemberId;

    private int boardId;

    private int userId;

    private String role; // OBSERVER, MEMBER, ADMIN

    private LocalDate addedAt;

    @PrePersist
    public void prePersist() {
        this.addedAt = LocalDate.now();
        if (this.role == null) this.role = "MEMBER";
    }
}