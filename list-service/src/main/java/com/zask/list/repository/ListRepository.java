package com.zask.list.repository;

import com.zask.list.entity.TaskList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ListRepository extends JpaRepository<TaskList, Integer> {
    List<TaskList> findByBoardId(int boardId);
    List<TaskList> findByBoardIdOrderByPosition(int boardId);
    List<TaskList> findByBoardIdAndIsArchived(int boardId, boolean isArchived);
    long countByBoardId(int boardId);
    Optional<TaskList> findTopByBoardIdOrderByPositionDesc(int boardId);
    void deleteByListId(int listId);
}