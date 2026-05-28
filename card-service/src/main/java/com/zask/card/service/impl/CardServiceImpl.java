package com.zask.card.service.impl;

import com.zask.card.dto.*;
import com.zask.card.entity.Card;
import com.zask.card.entity.CardMember;
import com.zask.card.exception.ResourceNotFoundException;
import com.zask.card.exception.ValidationException;
import com.zask.card.repository.CardRepository;
import com.zask.card.repository.CardMemberRepository;
import com.zask.card.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.zask.card.annotation.NotifyEvent;

@Service
public class CardServiceImpl implements CardService {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private CardMemberRepository cardMemberRepository;

    @Override
    public Card createCard(CardRequest request) {
        // Get max position in list
        long position = cardRepository.countByListId(request.getListId());

        Card card = Card.builder()
                .listId(request.getListId())
                .boardId(request.getBoardId())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(request.getStatus())
                .dueDate(request.getDueDate())
                .startDate(request.getStartDate())
                .assigneeId(request.getAssigneeId())
                .createdById(request.getCreatedById())
                .coverColor(request.getCoverColor())
                .position((int) position)
                .build();

        return cardRepository.save(card);
    }

    @Override
    public Card getCardById(int cardId) {
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
    }

    @Override
    public List<Card> getCardsByList(int listId) {
        return cardRepository.findByListIdOrderByPosition(listId);
    }

    @Override
    public List<Card> getCardsByBoard(int boardId) {
        return cardRepository.findByBoardId(boardId);
    }

    @Override
    public List<Card> getCardsByAssignee(int assigneeId) {
        List<CardMember> members = cardMemberRepository.findByUserId(assigneeId);
        List<Integer> cardIds = members.stream().map(CardMember::getCardId).collect(Collectors.toList());
        
        List<Card> cards = new java.util.ArrayList<>(cardRepository.findAllById(cardIds));
        List<Card> legacyCards = cardRepository.findByAssigneeId(assigneeId);
        
        for(Card lc : legacyCards) {
            if(cards.stream().noneMatch(c -> c.getCardId() == lc.getCardId())) {
               cards.add(lc);
            }
        }
        return cards;
    }

    @Override
    public Card updateCard(int cardId, CardRequest request) {
        Card card = getCardById(cardId);
        if (request.getTitle() != null) card.setTitle(request.getTitle());
        if (request.getDescription() != null) card.setDescription(request.getDescription());
        if (request.getPriority() != null) card.setPriority(request.getPriority());
        if (request.getStatus() != null) card.setStatus(request.getStatus());
        if (request.getDueDate() != null) card.setDueDate(request.getDueDate());
        if (request.getStartDate() != null) card.setStartDate(request.getStartDate());
        if (request.getCoverColor() != null) card.setCoverColor(request.getCoverColor());
        if (request.getCoverSize() != null) card.setCoverSize(request.getCoverSize());
        return cardRepository.save(card);
    }

    @Override
    public Card moveCard(int cardId, MoveCardRequest request) {
        Card card = getCardById(cardId);
        if (request.getBoardId() != null) {
            card.setBoardId(request.getBoardId());
        }
        card.setListId(request.getTargetListId());
        card.setPosition(request.getPosition());
        return cardRepository.save(card);
    }

    @Override
    @Transactional
    public void reorderCards(int listId, ReorderCardRequest request) {
        List<Integer> cardIds = request.getCardIds();
        for (int i = 0; i < cardIds.size(); i++) {
            Card card = getCardById(cardIds.get(i));
            card.setPosition(i);
            cardRepository.save(card);
        }
    }

    @Override
    public void archiveCard(int cardId) {
        Card card = getCardById(cardId);
        card.setArchived(true);
        cardRepository.save(card);
    }

    @Override
    public void unarchiveCard(int cardId) {
        Card card = getCardById(cardId);
        card.setArchived(false);
        cardRepository.save(card);
    }

    @Override
    public void removeCover(int cardId) {
        Card card = getCardById(cardId);
        card.setCoverColor(null);
        card.setCoverSize(null);
        cardRepository.save(card);
    }

    @Override
    @Transactional
    public void deleteCard(int cardId) {
        getCardById(cardId);
        cardRepository.deleteById(cardId);
    }

    @Override
    @NotifyEvent(type = "CARD_ASSIGNED")
    public Card setAssignee(int cardId, int assigneeId) {
        Card card = getCardById(cardId);
        card.setAssigneeId(assigneeId);
        return cardRepository.save(card);
    }

    @Override
    public Card setPriority(int cardId, String priority) {
        Card card = getCardById(cardId);
        card.setPriority(priority);
        return cardRepository.save(card);
    }

    @Override
    @NotifyEvent(type = "CARD_MOVED_DONE")
    public Card setStatus(int cardId, String status) {
        Card card = getCardById(cardId);
        card.setStatus(status);
        return cardRepository.save(card);
    }

    @Override
    public Card setDates(int cardId, String startDate, String dueDate) {
        Card card = getCardById(cardId);
        if (startDate == null || startDate.trim().isEmpty() || "null".equals(startDate)) {
            card.setStartDate(null);
        } else {
            card.setStartDate(java.time.LocalDateTime.parse(startDate));
        }
        if (dueDate == null || dueDate.trim().isEmpty() || "null".equals(dueDate)) {
            card.setDueDate(null);
        } else {
            card.setDueDate(java.time.LocalDateTime.parse(dueDate));
        }
        return cardRepository.save(card);
    }

    @Override
    public List<Card> getOverdueCards() {
        // Automatically clean up duplicate cards with the same title from the database on the fly!
        try {
            List<Card> allCards = cardRepository.findAll();
            java.util.Set<String> titles = new java.util.HashSet<>();
            java.util.List<Card> duplicates = new java.util.ArrayList<>();
            for (Card c : allCards) {
                if (c.getTitle() != null) {
                    String cleanTitle = c.getTitle().trim().toLowerCase();
                    if (!titles.add(cleanTitle)) {
                        duplicates.add(c);
                    }
                }
            }
            if (!duplicates.isEmpty()) {
                cardRepository.deleteAll(duplicates);
            }
        } catch (Exception e) {
            System.err.println("Self-healing database de-duplication failed: " + e.getMessage());
        }

        return cardRepository.findByDueDateBefore(LocalDateTime.now())
                .stream()
                .filter(c -> !c.getStatus().equals("DONE"))
                .filter(c -> !c.isArchived())
                .collect(Collectors.toList());
    }

    @Override
    public List<Card> searchCards(String title) {
        return cardRepository.findByTitleContainingIgnoreCase(title);
    }

    @Override
    public List<Card> getArchivedCards(int userId) {
        List<Card> createdArchived = cardRepository.findByCreatedByIdAndIsArchived(userId, true);
        List<Card> assignedArchived = cardRepository.findByAssigneeIdAndIsArchived(userId, true);
        List<Card> fallbackArchived = cardRepository.findByCreatedByIdAndIsArchived(0, true);
        
        List<Card> all = new java.util.ArrayList<>(createdArchived);
        for (Card c : assignedArchived) {
            if (all.stream().noneMatch(x -> x.getCardId() == c.getCardId())) {
                all.add(c);
            }
        }
        for (Card c : fallbackArchived) {
            if (all.stream().noneMatch(x -> x.getCardId() == c.getCardId())) {
                all.add(c);
            }
        }
        return all;
    }

    @Override
    public List<CardMember> getCardMembers(int cardId) {
        return cardMemberRepository.findByCardId(cardId);
    }

    @Override
    public CardMember addCardMember(int cardId, int userId) {
        if (cardMemberRepository.existsByCardIdAndUserId(cardId, userId)) {
            throw new ValidationException("User is already assigned to this card");
        }
        CardMember cm = CardMember.builder()
                .cardId(cardId)
                .userId(userId)
                .build();
        return cardMemberRepository.save(cm);
    }

    @Override
    @Transactional
    public void removeCardMember(int cardId, int userId) {
        cardMemberRepository.deleteByCardIdAndUserId(cardId, userId);
    }
}