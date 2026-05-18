package com.zask.notification.repository;

import com.zask.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByRecipientIdOrRecipientId(int recipientId1, int recipientId2);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(n) FROM Notification n WHERE (n.recipientId = ?1 OR n.recipientId = ?2) AND n.isRead = ?3")
    long countByRecipientIdOrRecipientIdAndIsRead(int recipientId1, int recipientId2, boolean isRead);
    
    List<Notification> findByRecipientIdAndIsRead(int recipientId, boolean isRead);
    void deleteByRecipientIdAndIsRead(int recipientId, boolean isRead);
    void deleteByRecipientId(int recipientId);
}