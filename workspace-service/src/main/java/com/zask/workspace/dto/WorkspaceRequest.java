package com.zask.workspace.dto;

import lombok.Data;

@Data
public class WorkspaceRequest {
    private String name;
    private String description;
    private int ownerId;
    private String visibility;
    private String logoUrl;
}