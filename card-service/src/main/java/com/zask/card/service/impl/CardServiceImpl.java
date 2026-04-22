package com.zask.card.service.impl;

import com.zask.card.dto.*;
import com.zask.card.entity.Card;
import com.zask.card.repository.CardRepository;
import com.zask.card.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CardServiceImpl implements CardService {

    @Autowired
    private CardRepository cardRepository;

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
                .orElseThrow(() -> new RuntimeException("Card not found"));
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
        return cardRepository.findByAssigneeId(assigneeId);
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
        return cardRepository.save(card);
    }

    @Override
    public Card moveCard(int cardId, MoveCardRequest request) {
        Card card = getCardById(cardId);
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
    @Transactional
    public void deleteCard(int cardId) {
        getCardById(cardId);
        cardRepository.deleteById(cardId);
    }

    @Override
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
    public Card setStatus(int cardId, String status) {
        Card card = getCardById(cardId);
        card.setStatus(status);
        return cardRepository.save(card);
    }

    @Override
    public List<Card> getOverdueCards() {
        return cardRepository.findByDueDateBefore(LocalDate.now())
                .stream()
                .filter(c -> !c.getStatus().equals("DONE"))
                .filter(c -> !c.isArchived())
                .collect(Collectors.toList());
    }

    @Override
    public List<Card> searchCards(String title) {
        return cardRepository.findByTitleContainingIgnoreCase(title);
    }
}