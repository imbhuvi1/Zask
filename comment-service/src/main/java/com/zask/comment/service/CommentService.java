package com.zask.comment.service;

import com.zask.comment.dto.*;
import com.zask.comment.entity.*;
import java.util.List;

public interface CommentService {
    Comment addComment(CommentRequest request);
    List<Comment> getByCard(int cardId);
    Comment getCommentById(int commentId);
    List<Comment> getReplies(int parentCommentId);
    Comment updateComment(int commentId, String content);
    void deleteComment(int commentId);
    Attachment addAttachment(AttachmentRequest request);
    List<Attachment> getAttachmentsByCard(int cardId);
    void deleteAttachment(int attachmentId);
    long getCommentCount(int cardId);
}