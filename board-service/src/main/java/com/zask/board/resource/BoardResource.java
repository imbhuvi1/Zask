package com.zask.board.resource;

import com.zask.board.dto.*;
import com.zask.board.entity.*;
import com.zask.board.service.BoardService;
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
@RequestMapping("/api/v1/boards")
@CrossOrigin(origins = "*")
@Tag(name = "Board Management", description = "Endpoints for creating, updating, deleting, closing boards, and managing board memberships")
public class BoardResource {

    @Autowired
    private BoardService boardService;

    @PostMapping
    @Operation(summary = "Create a new board", description = "Creates a board with workspaceId, name, description, background, and visibility settings.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Board created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid board request details")
    })
    public ResponseEntity<?> create(@Valid @RequestBody BoardRequest request) {
        try {
            return ResponseEntity.ok(boardService.createBoard(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{boardId}")
    @Operation(summary = "Get board by ID", description = "Retrieves board details by unique board ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Board found"),
        @ApiResponse(responseCode = "404", description = "Board not found")
    })
    public ResponseEntity<?> getById(@PathVariable int boardId) {
        try {
            return ResponseEntity.ok(boardService.getBoardById(boardId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/workspace/{workspaceId}")
    @Operation(summary = "Get boards by workspace", description = "Retrieves all boards that belong to the given workspace.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Boards retrieved successfully")
    })
    public ResponseEntity<List<Board>> getByWorkspace(@PathVariable int workspaceId) {
        return ResponseEntity.ok(boardService.getBoardsByWorkspace(workspaceId));
    }

    @GetMapping("/member/{userId}")
    @Operation(summary = "Get boards by member", description = "Retrieves all boards where the given user is a member.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Boards retrieved successfully")
    })
    public ResponseEntity<List<Board>> getByMember(@PathVariable int userId) {
        return ResponseEntity.ok(boardService.getBoardsByMember(userId));
    }

    @GetMapping("/public")
    @Operation(summary = "Get all public boards", description = "Retrieves all boards that have visibility set to PUBLIC.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Public boards retrieved successfully")
    })
    public ResponseEntity<List<Board>> getPublicBoards() {
        return ResponseEntity.ok(boardService.getPublicBoards());
    }

    @PutMapping("/{boardId}")
    @Operation(summary = "Update board details", description = "Updates fields of an existing board (name, description, background, visibility, starred/closed status).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Board updated successfully"),
        @ApiResponse(responseCode = "404", description = "Board not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request arguments")
    })
    public ResponseEntity<?> update(@PathVariable int boardId,
                                    @Valid @RequestBody BoardRequest request) {
        try {
            return ResponseEntity.ok(boardService.updateBoard(boardId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{boardId}/close")
    @Operation(summary = "Close a board", description = "Closes/archives a board.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Board closed successfully"),
        @ApiResponse(responseCode = "404", description = "Board not found")
    })
    public ResponseEntity<?> close(@PathVariable int boardId) {
        try {
            boardService.closeBoard(boardId);
            return ResponseEntity.ok(Map.of("message", "Board closed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{boardId}")
    @Operation(summary = "Delete a board", description = "Permanently deletes a board and its associated members from the system.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Board deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Board not found")
    })
    public ResponseEntity<?> delete(@PathVariable int boardId) {
        try {
            boardService.deleteBoard(boardId);
            return ResponseEntity.ok(Map.of("message", "Board deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/workspace/{workspaceId}")
    @Operation(summary = "Delete all boards in workspace", description = "Permanently deletes all boards that belong to the given workspace ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All boards deleted successfully")
    })
    public ResponseEntity<?> deleteByWorkspace(@PathVariable int workspaceId) {
        try {
            boardService.deleteBoardsByWorkspace(workspaceId);
            return ResponseEntity.ok(Map.of("message", "All boards in workspace deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{boardId}/members")
    @Operation(summary = "Add member to board", description = "Adds a user as a member of the board with a specified role.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Member added successfully"),
        @ApiResponse(responseCode = "400", description = "User is already a member"),
        @ApiResponse(responseCode = "404", description = "Board not found")
    })
    public ResponseEntity<?> addMember(@PathVariable int boardId,
                                       @Valid @RequestBody BoardMemberRequest request) {
        try {
            return ResponseEntity.ok(boardService.addMember(boardId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{boardId}/members/{userId}")
    @Operation(summary = "Remove member from board", description = "Removes a user from the board.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Member removed successfully")
    })
    public ResponseEntity<?> removeMember(@PathVariable int boardId,
                                          @PathVariable int userId) {
        try {
            boardService.removeMember(boardId, userId);
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/workspace/{workspaceId}/members/{userId}")
    @Operation(summary = "Remove user from all boards in workspace", description = "Removes a user's membership from all boards belonging to a workspace.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Member removed from all workspace boards successfully")
    })
    public ResponseEntity<?> removeMemberFromWorkspaceBoards(@PathVariable int workspaceId,
                                                           @PathVariable int userId) {
        try {
            boardService.removeMemberFromWorkspaceBoards(workspaceId, userId);
            return ResponseEntity.ok(Map.of("message", "Member removed from all workspace boards"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{boardId}/members/{userId}")
    @Operation(summary = "Update member role", description = "Updates a board member's role (e.g. ADMIN, MEMBER).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Role updated successfully"),
        @ApiResponse(responseCode = "404", description = "Member not found")
    })
    public ResponseEntity<?> updateRole(@PathVariable int boardId,
                                        @PathVariable int userId,
                                        @RequestBody Map<String, String> body) {
        try {
            boardService.updateMemberRole(boardId, userId, body.get("role"));
            return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{boardId}/members")
    @Operation(summary = "Get board members", description = "Retrieves the list of all members assigned to the board.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Board members retrieved successfully")
    })
    public ResponseEntity<List<BoardMember>> getMembers(@PathVariable int boardId) {
        return ResponseEntity.ok(boardService.getMembers(boardId));
    }

    @GetMapping("/search")
    @Operation(summary = "Search boards by name", description = "Searches for boards whose names match the query string.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search results returned successfully")
    })
    public ResponseEntity<List<Board>> search(@RequestParam String name) {
        return ResponseEntity.ok(boardService.searchBoards(name));
    }
}