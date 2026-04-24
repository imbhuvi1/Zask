package com.zask.notification.resource;

import com.zask.notification.dto.*;
import com.zask.notification.entity.Notification;
import com.zask.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
public class NotificationResource {

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public ResponseEntity<?> send(@RequestBody NotificationRequest request) {
        try {
            return ResponseEntity.ok(notificationService.send(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> sendBulk(@RequestBody BulkNotificationRequest request) {
        try {
            notificationService.sendBulk(request);
            return ResponseEntity.ok(Map.of("message", "Bulk notifications sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/recipient/{recipientId}")
    public ResponseEntity<List<Notification>> getByRecipient(
            @PathVariable int recipientId) {
        return ResponseEntity.ok(notificationService.getByRecipient(recipientId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Notification>> getAll() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @GetMapping("/unread/{recipientId}")
    public ResponseEntity<?> getUnreadCount(@PathVariable int recipientId) {
        return ResponseEntity.ok(Map.of("unreadCount",
                notificationService.getUnreadCount(recipientId)));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable int notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(Map.of("message", "Marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/read-all/{recipientId}")
    public ResponseEntity<?> markAllRead(@PathVariable int recipientId) {
        try {
            notificationService.markAllRead(recipientId);
            return ResponseEntity.ok(Map.of("message", "All marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/read/{recipientId}")
    public ResponseEntity<?> deleteRead(@PathVariable int recipientId) {
        try {
            notificationService.deleteRead(recipientId);
            return ResponseEntity.ok(Map.of("message", "Read notifications deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> delete(@PathVariable int notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok(Map.of("message", "Notification deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}