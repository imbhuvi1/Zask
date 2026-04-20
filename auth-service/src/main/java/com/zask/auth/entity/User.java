package com.zask.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    @NotBlank
    private String fullName;

    @Email
    @Column(unique = true, nullable = false)
    private String email;

    private String passwordHash;

    @Column(unique = true)
    private String username;

    private String role;

    private String avatarUrl;

    private String provider;

    @Column(name = "is_active")
    private boolean active;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.role == null) this.role = "MEMBER";
        if (this.provider == null) this.provider = "LOCAL";
        this.active = true;  // explicitly set here
    }
}