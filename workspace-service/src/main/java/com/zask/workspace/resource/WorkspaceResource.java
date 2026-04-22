package com.zask.workspace.resource;

import com.zask.workspace.dto.*;
import com.zask.workspace.entity.*;
import com.zask.workspace.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/workspaces")
@CrossOrigin(origins = "*")
public class WorkspaceResource {

    @Autowired
    private WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody WorkspaceRequest request) {
        try {
            return ResponseEntity.ok(workspaceService.createWorkspace(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<?> getById(@PathVariable int workspaceId) {
        try {
            return ResponseEntity.ok(workspaceService.getById(workspaceId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Workspace>> getByOwner(@PathVariable int ownerId) {
        return ResponseEntity.ok(workspaceService.getByOwner(ownerId));
    }

    @GetMapping("/member/{userId}")
    public ResponseEntity<List<Workspace>> getByMember(@PathVariable int userId) {
        return ResponseEntity.ok(workspaceService.getByMember(userId));
    }

    @PutMapping("/{workspaceId}")
    public ResponseEntity<?> update(@PathVariable int workspaceId,
                                    @RequestBody WorkspaceRequest request) {
        try {
            return ResponseEntity.ok(workspaceService.updateWorkspace(workspaceId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<?> delete(@PathVariable int workspaceId) {
        try {
            workspaceService.deleteWorkspace(workspaceId);
            return ResponseEntity.ok(Map.of("message", "Workspace deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<?> addMember(@PathVariable int workspaceId,
                                       @RequestBody WorkspaceMemberRequest request) {
        try {
            return ResponseEntity.ok(workspaceService.addMember(workspaceId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{workspaceId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable int workspaceId,
                                          @PathVariable int userId) {
        try {
            workspaceService.removeMember(workspaceId, userId);
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{workspaceId}/members/{userId}")
    public ResponseEntity<?> updateRole(@PathVariable int workspaceId,
                                        @PathVariable int userId,
                                        @RequestBody Map<String, String> body) {
        try {
            workspaceService.updateMemberRole(workspaceId, userId, body.get("role"));
            return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<WorkspaceMember>> getMembers(@PathVariable int workspaceId) {
        return ResponseEntity.ok(workspaceService.getMembers(workspaceId));
    }
}