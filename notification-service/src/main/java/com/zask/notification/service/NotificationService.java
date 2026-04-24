package com.zask.notification.service;

import com.zask.notification.dto.*;
import com.zask.notification.entity.Notification;
import java.util.List;

public interface NotificationService {
    Notification send(NotificationRequest request);
    void sendBulk(BulkNotificationRequest request);
    void markAsRead(int notificationId);
    void markAllRead(int recipientId);
    void deleteRead(int recipientId);
    List<Notification> getByRecipient(int recipientId);
    long getUnreadCount(int recipientId);
    void deleteNotification(int notificationId);
    List<Notification> getAll();
}