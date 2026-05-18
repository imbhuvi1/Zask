package com.zask.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action; // e.g. "CARD_CREATED", "USER_SUSPENDED"
    private String entityType; // e.g. "CARD", "USER", "WORKSPACE"
    private String entityId;
    private String details;
    private Integer performedBy; // userId
    private String performedByName;
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }
}
