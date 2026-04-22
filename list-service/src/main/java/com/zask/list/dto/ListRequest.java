package com.zask.list.dto;

import lombok.Data;

@Data
public class ListRequest {
    private int boardId;
    private String name;
    private String color;
}