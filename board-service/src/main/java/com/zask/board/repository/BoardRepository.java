package com.zask.board.repository;

import com.zask.board.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Integer> {
    List<Board> findByWorkspaceId(int workspaceId);
    List<Board> findByCreatedById(int createdById);
    List<Board> findByVisibility(String visibility);
    long countByWorkspaceId(int workspaceId);
    List<Board> findByIsClosed(boolean isClosed);
}