package com.zask.workspace.dto;

import lombok.Data;

@Data
public class WorkspaceMemberRequest {
    private int userId;
    private String role;
}