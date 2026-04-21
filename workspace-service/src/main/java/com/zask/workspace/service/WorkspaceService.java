package com.zask.workspace.service;

import com.zask.workspace.dto.*;
import com.zask.workspace.entity.*;
import java.util.List;

public interface WorkspaceService {
    Workspace createWorkspace(WorkspaceRequest request);
    Workspace getById(int workspaceId);
    List<Workspace> getByOwner(int ownerId);
    List<Workspace> getByMember(int userId);
    Workspace updateWorkspace(int workspaceId, WorkspaceRequest request);
    void deleteWorkspace(int workspaceId);
    WorkspaceMember addMember(int workspaceId, WorkspaceMemberRequest request);
    void removeMember(int workspaceId, int userId);
    void updateMemberRole(int workspaceId, int userId, String role);
    List<WorkspaceMember> getMembers(int workspaceId);
}