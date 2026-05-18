package com.zask.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int notificationId;

    private int recipientId;

    private int actorId;

    private String type; // ASSIGNMENT, MENTION, DUE_DATE, COMMENT, MOVE

    private String title;

    private String message;

    private int relatedId; // cardId or boardId

    private String relatedType; // CARD or BOARD

    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    private boolean isRead;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }
}