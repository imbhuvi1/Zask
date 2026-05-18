package com.zask.notification.dto;

import lombok.Data;

@Data
public class BroadcastRequest {
    private String title;
    private String message;
    private String type; // INFO, WARNING, SUCCESS
    private String targetGroup; // ALL, ADMINS, USERS
}
