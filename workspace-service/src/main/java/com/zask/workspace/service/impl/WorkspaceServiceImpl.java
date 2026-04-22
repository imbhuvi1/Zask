package com.zask.workspace.service.impl;

import com.zask.workspace.dto.*;
import com.zask.workspace.entity.*;
import com.zask.workspace.repository.*;
import com.zask.workspace.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkspaceServiceImpl implements WorkspaceService {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceMemberRepository memberRepository;

    @Override
    public Workspace createWorkspace(WorkspaceRequest request) {
        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .description(request.getDescription())
                .ownerId(request.getOwnerId())
                .visibility(request.getVisibility())
                .logoUrl(request.getLogoUrl())
                .build();
        Workspace saved = workspaceRepository.save(workspace);

        // Auto add owner as ADMIN member
        WorkspaceMember ownerMember = WorkspaceMember.builder()
                .workspaceId(saved.getWorkspaceId())
                .userId(request.getOwnerId())
                .role("ADMIN")
                .build();
        memberRepository.save(ownerMember);

        return saved;
    }

    @Override
    public Workspace getById(int workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
    }

    @Override
    public List<Workspace> getByOwner(int ownerId) {
        return workspaceRepository.findByOwnerId(ownerId);
    }

    @Override
    public List<Workspace> getByMember(int userId) {
        List<WorkspaceMember> memberships = memberRepository.findByUserId(userId);
        return memberships.stream()
                .map(m -> workspaceRepository.findById(m.getWorkspaceId()).orElse(null))
                .filter(w -> w != null)
                .collect(Collectors.toList());
    }

    @Override
    public Workspace updateWorkspace(int workspaceId, WorkspaceRequest request) {
        Workspace workspace = getById(workspaceId);
        if (request.getName() != null) workspace.setName(request.getName());
        if (request.getDescription() != null) workspace.setDescription(request.getDescription());
        if (request.getVisibility() != null) workspace.setVisibility(request.getVisibility());
        if (request.getLogoUrl() != null) workspace.setLogoUrl(request.getLogoUrl());
        return workspaceRepository.save(workspace);
    }

    @Override
    @Transactional
    public void deleteWorkspace(int workspaceId) {
        getById(workspaceId);
        memberRepository.findByWorkspaceId(workspaceId)
                .forEach(m -> memberRepository.delete(m));
        workspaceRepository.deleteById(workspaceId);
    }

    @Override
    public WorkspaceMember addMember(int workspaceId, WorkspaceMemberRequest request) {
        getById(workspaceId);
        if (memberRepository.existsByWorkspaceIdAndUserId(workspaceId, request.getUserId()))
            throw new RuntimeException("User is already a member");

        WorkspaceMember member = WorkspaceMember.builder()
                .workspaceId(workspaceId)
                .userId(request.getUserId())
                .role(request.getRole() != null ? request.getRole() : "MEMBER")
                .build();
        return memberRepository.save(member);
    }

    @Override
    @Transactional
    public void removeMember(int workspaceId, int userId) {
        memberRepository.deleteByWorkspaceIdAndUserId(workspaceId, userId);
    }

    @Override
    public void updateMemberRole(int workspaceId, int userId, String role) {
        WorkspaceMember member = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setRole(role);
        memberRepository.save(member);
    }

    @Override
    public List<WorkspaceMember> getMembers(int workspaceId) {
        return memberRepository.findByWorkspaceId(workspaceId);
    }
}