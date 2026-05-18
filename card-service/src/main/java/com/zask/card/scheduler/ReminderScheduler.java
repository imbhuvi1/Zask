package com.zask.card.scheduler;

import com.zask.card.entity.Card;
import com.zask.card.entity.CardMember;
import com.zask.card.repository.CardRepository;
import com.zask.card.repository.CardMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class ReminderScheduler {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private CardMemberRepository cardMemberRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    // Run every minute
    @Scheduled(fixedRate = 60000)
    public void checkDueDatesAndSendReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourFromNow = now.plusHours(1);
        
        // Find cards due in exactly 1 hour (within a 1-minute window)
        // Using stream for simplicity, but ideally this is a DB query
        List<Card> upcomingCards = cardRepository.findAll().stream()
            .filter(card -> card.getDueDate() != null && !card.isArchived() && !card.getStatus().equals("DONE"))
            .filter(card -> {
                LocalDateTime due = card.getDueDate();
                return due.isAfter(now) && due.isBefore(oneHourFromNow) && due.minusMinutes(60).isBefore(now.plusMinutes(1));
            })
            .toList();

        for (Card card : upcomingCards) {
            List<CardMember> members = cardMemberRepository.findByCardId(card.getCardId());
            for (CardMember member : members) {
                sendNotification(member.getUserId(), card);
            }
            // Also send to main assignee if any
            if (card.getAssigneeId() > 0 && members.stream().noneMatch(m -> m.getUserId() == card.getAssigneeId())) {
                sendNotification(card.getAssigneeId(), card);
            }
        }
    }

    private void sendNotification(int userId, Card card) {
        try {
            String url = "http://localhost:8080/api/v1/notifications";
            Map<String, Object> payload = Map.of(
                "userId", userId,
                "message", "Reminder: Card '" + card.getTitle() + "' is due soon!",
                "type", "DUE_DATE",
                "relatedId", card.getCardId(),
                "isRead", false
            );
            restTemplate.postForObject(url, payload, Object.class);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
}
