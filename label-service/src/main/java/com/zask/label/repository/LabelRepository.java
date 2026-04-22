package com.zask.label.repository;

import com.zask.label.entity.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LabelRepository extends JpaRepository<Label, Integer> {
    List<Label> findByBoardId(int boardId);
}