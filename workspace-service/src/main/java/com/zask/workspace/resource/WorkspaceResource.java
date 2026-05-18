package com.zask.workspace.resource;

import com.zask.workspace.dto.*;
import com.zask.workspace.entity.*;
import com.zask.workspace.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/workspaces")
@CrossOrigin(origins = "*")
@Tag(name = "Workspace Management", description = "Endpoints for creating, updating, deleting workspaces, managing workspace members, and roles")
public class WorkspaceResource {

    @Autowired
    private WorkspaceService workspaceService;

    @PostMapping
    @Operation(summary = "Create a new workspace", description = "Creates a workspace with owner, visibility settings, name, and logo.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Workspace created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request payload")
    })
    public ResponseEntity<?> create(@Valid @RequestBody WorkspaceRequest request) {
        try {
            return ResponseEntity.ok(workspaceService.createWorkspace(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{workspaceId}")
    @Operation(summary = "Get workspace by ID", description = "Retrieves workspace details by unique workspace ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Workspace found"),
        @ApiResponse(responseCode = "404", description = "Workspace not found")
    })
    public ResponseEntity<?> getById(@PathVariable int workspaceId) {
        try {
            return ResponseEntity.ok(workspaceService.getById(workspaceId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/owner/{ownerId}")
    @Operation(summary = "Get workspaces by owner", description = "Retrieves a list of all workspaces owned by the given user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Workspaces retrieved")
    })
    public ResponseEntity<List<Workspace>> getByOwner(@PathVariable int ownerId) {
        return ResponseEntity.ok(workspaceService.getByOwner(ownerId));
    }

    @GetMapping("/member/{userId}")
    @Operation(summary = "Get workspaces by member", description = "Retrieves a list of all workspaces where the given user is a member.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Workspaces retrieved")
    })
    public ResponseEntity<List<Workspace>> getByMember(@PathVariable int userId) {
        return ResponseEntity.ok(workspaceService.getByMember(userId));
    }

    @PutMapping("/{workspaceId}")
    @Operation(summary = "Update workspace details", description = "Updates details of an existing workspace.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Workspace updated successfully"),
        @ApiResponse(responseCode = "404", description = "Workspace not found"),
        @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<?> update(@PathVariable int workspaceId,
                                    @Valid @RequestBody WorkspaceRequest request) {
        try {
            return ResponseEntity.ok(workspaceService.updateWorkspace(workspaceId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{workspaceId}")
    @Operation(summary = "Delete workspace", description = "Permanently deletes a workspace and removes its members.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Workspace deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Workspace not found")
    })
    public ResponseEntity<?> delete(@PathVariable int workspaceId) {
        try {
            workspaceService.deleteWorkspace(workspaceId);
            return ResponseEntity.ok(Map.of("message", "Workspace deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{workspaceId}/members")
    @Operation(summary = "Add member to workspace", description = "Adds a registered user to the workspace with a specific role.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Member added successfully"),
        @ApiResponse(responseCode = "400", description = "User is already a member"),
        @ApiResponse(responseCode = "404", description = "Workspace not found")
    })
    public ResponseEntity<?> addMember(@PathVariable int workspaceId,
                                       @Valid @RequestBody WorkspaceMemberRequest request) {
        try {
            return ResponseEntity.ok(workspaceService.addMember(workspaceId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{workspaceId}/members/{userId}")
    @Operation(summary = "Remove member from workspace", description = "Removes a member from the workspace.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Member removed successfully")
    })
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
    @Operation(summary = "Update member role", description = "Updates a workspace member's role (e.g. ADMIN, MEMBER).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Role updated successfully"),
        @ApiResponse(responseCode = "404", description = "Member or workspace not found")
    })
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
    @Operation(summary = "Get workspace members", description = "Retrieves the list of all members in a given workspace.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Members retrieved successfully")
    })
    public ResponseEntity<List<WorkspaceMember>> getMembers(@PathVariable int workspaceId) {
        return ResponseEntity.ok(workspaceService.getMembers(workspaceId));
    }

    // --- Admin Endpoints ---
    @GetMapping("/admin/workspaces")
    @Operation(summary = "Get all workspaces (Admin only)", description = "Retrieves all workspaces registered in the system.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Workspaces retrieved")
    })
    public ResponseEntity<List<Workspace>> getAllWorkspaces() {
        return ResponseEntity.ok(workspaceService.getAllWorkspaces());
    }

    @GetMapping("/search")
    @Operation(summary = "Search workspaces by name", description = "Searches for workspaces whose name matches the query string.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search results returned")
    })
    public ResponseEntity<List<Workspace>> search(@RequestParam String name) {
        return ResponseEntity.ok(workspaceService.searchWorkspaces(name));
    }
}