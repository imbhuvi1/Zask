package com.zask.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NotificationRequest {
    private int recipientId;
    private int actorId;
    private String type;

    @NotBlank(message = "Notification title cannot be blank")
    @Size(max = 100, message = "Notification title cannot exceed 100 characters")
    private String title;

    @NotBlank(message = "Notification message cannot be blank")
    @Size(max = 500, message = "Notification message cannot exceed 500 characters")
    private String message;

    private int relatedId;
    private String relatedType;
}