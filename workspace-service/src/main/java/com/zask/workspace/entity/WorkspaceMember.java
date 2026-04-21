package com.zask.workspace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "workspace_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int memberId;

    private int workspaceId;

    private int userId;

    private String role; // ADMIN or MEMBER

    private LocalDate joinedAt;

    @PrePersist
    public void prePersist() {
        this.joinedAt = LocalDate.now();
        if (this.role == null) this.role = "MEMBER";
    }
}