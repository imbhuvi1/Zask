package com.zask.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequest {
    private int cardId;
    private int authorId;

    @NotBlank(message = "Comment content cannot be blank")
    @Size(max = 1000, message = "Comment content cannot exceed 1000 characters")
    private String content;

    private Integer parentCommentId;
}