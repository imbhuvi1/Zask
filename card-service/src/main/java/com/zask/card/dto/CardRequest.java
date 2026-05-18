package com.zask.card.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CardRequest {
    private int listId;
    private int boardId;

    @NotBlank(message = "Card title cannot be blank")
    @Size(max = 100, message = "Card title cannot exceed 100 characters")
    private String title;

    private String description;
    private String priority;
    private String status;
    private LocalDateTime dueDate;
    private LocalDateTime startDate;
    private int assigneeId;
    private int createdById;
    private String coverColor;
    private String coverSize;
}