package com.zask.label.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ChecklistItemRequest {
    private int checklistId;
    private String text;
    private int assigneeId;
    private LocalDate dueDate;
}