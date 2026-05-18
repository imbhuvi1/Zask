package com.zask.card.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "card_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int cardId;

    private int userId;

    private LocalDateTime assignedAt;

    @PrePersist
    public void prePersist() {
        this.assignedAt = LocalDateTime.now();
    }
}
