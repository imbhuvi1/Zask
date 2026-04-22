package com.zask.card.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReorderCardRequest {
    private List<Integer> cardIds;
}