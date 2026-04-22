package com.zask.comment.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private int cardId;
    private int authorId;
    private String content;
    private Integer parentCommentId;
}