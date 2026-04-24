package com.zask.notification.dto;

import lombok.Data;

@Data
public class NotificationRequest {
    private int recipientId;
    private int actorId;
    private String type;
    private String title;
    private String message;
    private int relatedId;
    private String relatedType;
}