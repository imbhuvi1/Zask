package com.zask.card.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CardRequest {
    private int listId;
    private int boardId;
    private String title;
    private String description;
    private String priority;
    private String status;
    private LocalDate dueDate;
    private LocalDate startDate;
    private int assigneeId;
    private int createdById;
    private String coverColor;
}