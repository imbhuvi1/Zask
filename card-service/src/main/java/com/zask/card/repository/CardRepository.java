package com.zask.card.repository;

import com.zask.card.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Integer> {
    List<Card> findByListId(int listId);
    List<Card> findByBoardId(int boardId);
    List<Card> findByAssigneeId(int assigneeId);
    List<Card> findByListIdOrderByPosition(int listId);
    List<Card> findByDueDateBefore(LocalDate date);
    List<Card> findByPriority(String priority);
    List<Card> findByStatus(String status);
    long countByListId(int listId);
    List<Card> findByBoardIdAndIsArchived(int boardId, boolean isArchived);
    List<Card> findByTitleContainingIgnoreCase(String title);
}