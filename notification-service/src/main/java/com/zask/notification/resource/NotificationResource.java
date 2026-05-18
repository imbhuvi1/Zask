package com.zask.notification.resource;

import com.zask.notification.dto.*;
import com.zask.notification.entity.Notification;
import com.zask.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
@Tag(name = "Notification Management", description = "Endpoints for sending single, bulk, broadcast notifications, counting unread, marking notifications as read/unread, and deletion")
public class NotificationResource {

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    @Operation(summary = "Send single notification", description = "Sends a notification to a specific recipient user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification sent successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request details")
    })
    public ResponseEntity<?> send(@Valid @RequestBody NotificationRequest request) {
        try {
            return ResponseEntity.ok(notificationService.send(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bulk")
    @Operation(summary = "Send bulk notifications", description = "Sends notifications to a list of specified recipient users.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bulk notifications sent successfully")
    })
    public ResponseEntity<?> sendBulk(@RequestBody BulkNotificationRequest request) {
        try {
            notificationService.sendBulk(request);
            return ResponseEntity.ok(Map.of("message", "Bulk notifications sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/broadcast")
    @Operation(summary = "Broadcast notification to all", description = "Sends a broadcast notification to all active system users.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Broadcast notification sent successfully")
    })
    public ResponseEntity<?> broadcast(@RequestBody BroadcastRequest request) {
        try {
            notificationService.broadcast(request);
            return ResponseEntity.ok(Map.of("message", "Broadcast sent to all users"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/recipient/{recipientId}")
    @Operation(summary = "Get user notifications", description = "Retrieves all notifications (both read and unread) for a specific user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully")
    })
    public ResponseEntity<List<Notification>> getByRecipient(
            @PathVariable int recipientId) {
        return ResponseEntity.ok(notificationService.getByRecipient(recipientId));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all notifications (Admin only)", description = "Retrieves all notifications logged in the database.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All notifications retrieved successfully")
    })
    public ResponseEntity<List<Notification>> getAll() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @GetMapping("/unread/{recipientId}")
    @Operation(summary = "Get unread count", description = "Retrieves the count of unread notifications for a user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Unread count retrieved successfully")
    })
    public ResponseEntity<?> getUnreadCount(@PathVariable int recipientId) {
        return ResponseEntity.ok(Map.of("unreadCount",
                notificationService.getUnreadCount(recipientId)));
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Mark single notification as read", description = "Marks a specific notification as read.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification marked as read successfully"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<?> markAsRead(@PathVariable int notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(Map.of("message", "Marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/read-all/{recipientId}")
    @Operation(summary = "Mark all notifications as read", description = "Marks all unread notifications for a specific user as read.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All notifications marked as read successfully")
    })
    public ResponseEntity<?> markAllRead(@PathVariable int recipientId) {
        try {
            notificationService.markAllRead(recipientId);
            return ResponseEntity.ok(Map.of("message", "All marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/read/{recipientId}")
    @Operation(summary = "Delete read notifications", description = "Permanently deletes all notifications that have been read for a user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Read notifications deleted successfully")
    })
    public ResponseEntity<?> deleteRead(@PathVariable int recipientId) {
        try {
            notificationService.deleteRead(recipientId);
            return ResponseEntity.ok(Map.of("message", "Read notifications deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Delete notification", description = "Permanently deletes a single notification by ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<?> delete(@PathVariable int notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok(Map.of("message", "Notification deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/recipient/{recipientId}")
    @Operation(summary = "Delete all user notifications", description = "Permanently deletes all notifications for a specific user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All user notifications deleted successfully")
    })
    public ResponseEntity<?> deleteAllByRecipient(@PathVariable int recipientId) {
        try {
            notificationService.deleteAllByRecipient(recipientId);
            return ResponseEntity.ok(Map.of("message", "All notifications deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}