package com.zask.comment.repository;

import com.zask.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByCardIdAndIsDeletedFalse(int cardId);
    List<Comment> findByAuthorIdAndIsDeletedFalse(int authorId);
    List<Comment> findByParentCommentIdAndIsDeletedFalse(int parentCommentId);
    long countByCardIdAndIsDeletedFalse(int cardId);
    void deleteByCommentId(int commentId);
}