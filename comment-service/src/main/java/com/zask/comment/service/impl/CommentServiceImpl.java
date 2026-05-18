package com.zask.comment.service.impl;

import com.zask.comment.dto.*;
import com.zask.comment.entity.*;
import com.zask.comment.exception.ResourceNotFoundException;
import com.zask.comment.exception.ValidationException;
import com.zask.comment.repository.*;
import com.zask.comment.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Override
    public Comment addComment(CommentRequest request) {
        Comment comment = Comment.builder()
                .cardId(request.getCardId())
                .authorId(request.getAuthorId())
                .content(request.getContent())
                .parentCommentId(request.getParentCommentId())
                .build();
        return commentRepository.save(comment);
    }

    @Override
    public List<Comment> getByCard(int cardId) {
        return commentRepository.findByCardIdAndIsDeletedFalse(cardId);
    }

    @Override
    public Comment getCommentById(int commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    }

    @Override
    public List<Comment> getReplies(int parentCommentId) {
        return commentRepository.findByParentCommentIdAndIsDeletedFalse(parentCommentId);
    }

    @Override
    public Comment updateComment(int commentId, String content) {
        Comment comment = getCommentById(commentId);
        comment.setContent(content);
        return commentRepository.save(comment);
    }

    @Override
    @Transactional
    public void deleteComment(int commentId) {
        Comment comment = getCommentById(commentId);
        comment.setDeleted(true);
        commentRepository.save(comment);
    }

    @Override
    public Attachment addAttachment(AttachmentRequest request) {
        Attachment attachment = Attachment.builder()
                .cardId(request.getCardId())
                .uploaderId(request.getUploaderId())
                .fileName(request.getFileName())
                .fileUrl(request.getFileUrl())
                .fileType(request.getFileType())
                .sizeKb(request.getSizeKb())
                .build();
        return attachmentRepository.save(attachment);
    }

    @Override
    public List<Attachment> getAttachmentsByCard(int cardId) {
        return attachmentRepository.findByCardId(cardId);
    }

    @Override
    @Transactional
    public void deleteAttachment(int attachmentId) {
        attachmentRepository.deleteById(attachmentId);
    }

    @Override
    public long getCommentCount(int cardId) {
        return commentRepository.countByCardIdAndIsDeletedFalse(cardId);
    }

    @Override
    public Comment likeComment(int commentId) {
        Comment comment = getCommentById(commentId);
        comment.setLikeCount(comment.getLikeCount() + 1);
        return commentRepository.save(comment);
    }

    @Override
    public Reaction addReaction(int commentId, int userId, String emoji) {
        if (reactionRepository.existsByCommentIdAndUserIdAndEmoji(commentId, userId, emoji)) {
            throw new ValidationException("Reaction already exists");
        }
        Reaction reaction = Reaction.builder()
                .commentId(commentId)
                .userId(userId)
                .emoji(emoji)
                .build();
        return reactionRepository.save(reaction);
    }

    @Override
    @Transactional
    public void removeReaction(int commentId, int userId, String emoji) {
        reactionRepository.deleteByCommentIdAndUserIdAndEmoji(commentId, userId, emoji);
    }

    @Override
    public List<Reaction> getReactions(int commentId) {
        return reactionRepository.findByCommentId(commentId);
    }
}