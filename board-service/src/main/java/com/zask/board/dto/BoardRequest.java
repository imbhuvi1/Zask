package com.zask.board.dto;

import lombok.Data;

@Data
public class BoardRequest {
    private int workspaceId;
    private String name;
    private String description;
    private String background;
    private String visibility;
    private int createdById;
}