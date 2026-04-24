package com.zask.notification.repository;

import com.zask.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByRecipientId(int recipientId);
    List<Notification> findByRecipientIdAndIsRead(int recipientId, boolean isRead);
    long countByRecipientIdAndIsRead(int recipientId, boolean isRead);
    List<Notification> findByType(String type);
    List<Notification> findByRelatedId(int relatedId);
    void deleteByNotificationId(int notificationId);
    void deleteByRecipientIdAndIsRead(int recipientId, boolean isRead);
}