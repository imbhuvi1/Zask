package com.zask.comment.repository;

import com.zask.comment.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Integer> {
    List<Reaction> findByCommentId(int commentId);
    void deleteByCommentIdAndUserIdAndEmoji(int commentId, int userId, String emoji);
    boolean existsByCommentIdAndUserIdAndEmoji(int commentId, int userId, String emoji);
}
