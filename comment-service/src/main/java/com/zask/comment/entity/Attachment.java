package com.zask.comment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int attachmentId;

    private int cardId;

    private int uploaderId;

    private String fileName;

    private String fileUrl;

    private String fileType;

    private long sizeKb;

    private LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        this.uploadedAt = LocalDateTime.now();
    }
}