package com.zask.label.repository;

import com.zask.label.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Integer> {
    List<ChecklistItem> findByChecklistId(int checklistId);
    long countByChecklistId(int checklistId);
    long countByChecklistIdAndIsCompleted(int checklistId, boolean isCompleted);
}