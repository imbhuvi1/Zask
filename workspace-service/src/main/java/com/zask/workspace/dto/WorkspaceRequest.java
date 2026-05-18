package com.zask.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class WorkspaceRequest {
    @NotBlank(message = "Workspace name cannot be blank")
    @Size(max = 100, message = "Workspace name cannot exceed 100 characters")
    private String name;

    private String description;
    private int ownerId;
    private String visibility;
    private String logoUrl;
}