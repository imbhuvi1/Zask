package com.zask.label.repository;

import com.zask.label.entity.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChecklistRepository extends JpaRepository<Checklist, Integer> {
    List<Checklist> findByCardId(int cardId);
}