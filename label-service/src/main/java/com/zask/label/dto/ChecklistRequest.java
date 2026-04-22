package com.zask.label.dto;

import lombok.Data;

@Data
public class ChecklistRequest {
    private int cardId;
    private String title;
    private int position;
}