package com.zask.label.dto;

import lombok.Data;

@Data
public class LabelRequest {
    private int boardId;
    private String name;
    private String color;
}