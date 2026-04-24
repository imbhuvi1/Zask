package com.zask.notification.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkNotificationRequest {
    private List<Integer> recipientIds;
    private String title;
    private String message;
    private String type;
}