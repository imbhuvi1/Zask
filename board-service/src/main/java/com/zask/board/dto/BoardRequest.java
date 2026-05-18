package com.zask.board.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BoardRequest {
    private int workspaceId;

    @NotBlank(message = "Board name cannot be blank")
    @Size(max = 100, message = "Board name cannot exceed 100 characters")
    private String name;

    private String description;
    private String background;
    private String visibility;
    private int createdById;
    private Boolean isClosed;
    private Boolean isStarred;
}