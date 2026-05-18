package com.zask.card.aspect;

import com.zask.card.annotation.NotifyEvent;
import com.zask.card.entity.Card;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
public class NotificationAspect {

    @Autowired
    private RestTemplate restTemplate;

    private static final String NOTIFICATION_SERVICE_URL = "http://notification-service/api/v1/notifications";

    @AfterReturning(pointcut = "@annotation(notifyEvent)", returning = "result")
    public void sendNotification(JoinPoint joinPoint, NotifyEvent notifyEvent, Object result) {
        try {
            if (result instanceof Card card) {
                Map<String, Object> notification = new HashMap<>();
                notification.put("title", "Card Update");
                notification.put("type", notifyEvent.type());
                notification.put("relatedId", card.getBoardId()); // Deep link to board
                notification.put("relatedType", "BOARD");
                notification.put("actorId", card.getCreatedById());
                
                String message = notifyEvent.message();
                int recipientId = -1;

                if ("CARD_ASSIGNED".equals(notifyEvent.type())) {
                    recipientId = card.getAssigneeId();
                    message = "You have been assigned to card: " + card.getTitle();
                } else if ("CARD_MOVED_DONE".equals(notifyEvent.type())) {
                    recipientId = card.getCreatedById(); // Notify creator
                    message = "Your card \"" + card.getTitle() + "\" has been moved to DONE";
                }

                if (recipientId != 0 && recipientId != -1) {
                    notification.put("recipientId", recipientId);
                    notification.put("message", message);
                    restTemplate.postForObject(NOTIFICATION_SERVICE_URL, notification, Map.class);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
}
