package com.zask.notification.service.impl;

import com.zask.notification.dto.*;
import com.zask.notification.entity.Notification;
import com.zask.notification.exception.ResourceNotFoundException;
import com.zask.notification.repository.NotificationRepository;
import com.zask.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public Notification send(NotificationRequest request) {
        Notification notification = Notification.builder()
                .recipientId(request.getRecipientId())
                .actorId(request.getActorId())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .relatedId(request.getRelatedId())
                .relatedType(request.getRelatedType())
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    public void sendBulk(BulkNotificationRequest request) {
        request.getRecipientIds().forEach(recipientId -> {
            Notification notification = Notification.builder()
                    .recipientId(recipientId)
                    .actorId(0)
                    .type(request.getType() != null ? request.getType() : "BROADCAST")
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .build();
            notificationRepository.save(notification);
        });
    }

    @Override
    public void markAsRead(int notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllRead(int recipientId) {
        List<Notification> notifications = notificationRepository
                .findByRecipientIdAndIsRead(recipientId, false);
        notifications.forEach(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void deleteRead(int recipientId) {
        notificationRepository
                .deleteByRecipientIdAndIsRead(recipientId, true);
    }

    @Override
    public List<Notification> getByRecipient(int recipientId) {
        // Return user-specific + global broadcasts
        return notificationRepository.findByRecipientIdOrRecipientId(recipientId, -1);
    }

    @Override
    public long getUnreadCount(int recipientId) {
        return notificationRepository.countByRecipientIdOrRecipientIdAndIsRead(recipientId, -1, false);
    }

    @Override
    public void deleteNotification(int notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Override
    @Transactional
    public void deleteAllByRecipient(int recipientId) {
        notificationRepository.deleteByRecipientId(recipientId);
    }

    @Override
    public List<Notification> getAll() {
        return notificationRepository.findAll();
    }

    @Override
    public void broadcast(BroadcastRequest request) {
        Notification notification = Notification.builder()
                .recipientId(-1) // Special ID for all users
                .actorId(0)
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .build();
        notificationRepository.save(notification);
    }
}