package com.zask.card.service;

import com.zask.card.dto.*;
import com.zask.card.entity.Card;
import java.util.List;

public interface CardService {
    Card createCard(CardRequest request);
    Card getCardById(int cardId);
    List<Card> getCardsByList(int listId);
    List<Card> getCardsByBoard(int boardId);
    List<Card> getCardsByAssignee(int assigneeId);
    Card updateCard(int cardId, CardRequest request);
    Card moveCard(int cardId, MoveCardRequest request);
    void reorderCards(int listId, ReorderCardRequest request);
    void archiveCard(int cardId);
    void unarchiveCard(int cardId);
    void deleteCard(int cardId);
    Card setAssignee(int cardId, int assigneeId);
    Card setPriority(int cardId, String priority);
    Card setStatus(int cardId, String status);
    List<Card> getOverdueCards();
    List<Card> searchCards(String title);
}