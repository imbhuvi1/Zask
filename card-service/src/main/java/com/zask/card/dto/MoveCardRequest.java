package com.zask.card.dto;

import lombok.Data;

@Data
public class MoveCardRequest {
    private int targetListId;
    private int position;
}