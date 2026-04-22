package com.zask.comment.repository;

import com.zask.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByCardId(int cardId);
    List<Comment> findByAuthorId(int authorId);
    List<Comment> findByParentCommentId(int parentCommentId);
    long countByCardId(int cardId);
    void deleteByCommentId(int commentId);
}