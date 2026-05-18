package com.zask.list.resource;

import com.zask.list.dto.*;
import com.zask.list.entity.TaskList;
import com.zask.list.service.ListService;
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
@RequestMapping("/api/v1/lists")
@CrossOrigin(origins = "*")
@Tag(name = "List Management", description = "Endpoints for creating, updating, deleting, archiving, moving, and reordering task lists")
public class ListResource {

    @Autowired
    private ListService listService;

    @PostMapping
    @Operation(summary = "Create a new task list", description = "Creates a list inside a specified board.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request details")
    })
    public ResponseEntity<?> create(@Valid @RequestBody ListRequest request) {
        try {
            return ResponseEntity.ok(listService.createList(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{listId}")
    @Operation(summary = "Get list by ID", description = "Retrieves list details by unique list ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List found"),
        @ApiResponse(responseCode = "404", description = "List not found")
    })
    public ResponseEntity<?> getById(@PathVariable int listId) {
        try {
            return ResponseEntity.ok(listService.getListById(listId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/board/{boardId}")
    @Operation(summary = "Get lists by board", description = "Retrieves all active lists belonging to the given board.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lists retrieved successfully")
    })
    public ResponseEntity<List<TaskList>> getByBoard(@PathVariable int boardId) {
        return ResponseEntity.ok(listService.getListsByBoard(boardId));
    }

    @GetMapping("/board/{boardId}/archived")
    @Operation(summary = "Get archived lists", description = "Retrieves all archived lists inside a board.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Archived lists retrieved successfully")
    })
    public ResponseEntity<List<TaskList>> getArchived(@PathVariable int boardId) {
        return ResponseEntity.ok(listService.getArchivedLists(boardId));
    }

    @PutMapping("/{listId}")
    @Operation(summary = "Update list details", description = "Updates fields of an existing task list (e.g. name, position, isArchived).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List updated successfully"),
        @ApiResponse(responseCode = "404", description = "List not found")
    })
    public ResponseEntity<?> update(@PathVariable int listId,
                                    @Valid @RequestBody ListRequest request) {
        try {
            return ResponseEntity.ok(listService.updateList(listId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/board/{boardId}/reorder")
    @Operation(summary = "Reorder lists in board", description = "Sets the new positions of all lists in a specified board.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lists reordered successfully")
    })
    public ResponseEntity<?> reorder(@PathVariable int boardId,
                                     @RequestBody ReorderRequest request) {
        try {
            listService.reorderLists(boardId, request);
            return ResponseEntity.ok(Map.of("message", "Lists reordered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{listId}/archive")
    @Operation(summary = "Archive list", description = "Archives a task list.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List archived successfully"),
        @ApiResponse(responseCode = "404", description = "List not found")
    })
    public ResponseEntity<?> archive(@PathVariable int listId) {
        try {
            listService.archiveList(listId);
            return ResponseEntity.ok(Map.of("message", "List archived successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{listId}/unarchive")
    @Operation(summary = "Unarchive list", description = "Restores an archived task list.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List unarchived successfully"),
        @ApiResponse(responseCode = "404", description = "List not found")
    })
    public ResponseEntity<?> unarchive(@PathVariable int listId) {
        try {
            listService.unarchiveList(listId);
            return ResponseEntity.ok(Map.of("message", "List unarchived successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{listId}/move/{targetBoardId}")
    @Operation(summary = "Move list to target board", description = "Moves a task list and all its cards to a target board.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List moved successfully"),
        @ApiResponse(responseCode = "404", description = "List or target board not found")
    })
    public ResponseEntity<?> move(@PathVariable int listId,
                                  @PathVariable int targetBoardId) {
        try {
            listService.moveList(listId, targetBoardId);
            return ResponseEntity.ok(Map.of("message", "List moved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{listId}")
    @Operation(summary = "Delete list", description = "Permanently deletes a task list from the database.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List deleted successfully"),
        @ApiResponse(responseCode = "404", description = "List not found")
    })
    public ResponseEntity<?> delete(@PathVariable int listId) {
        try {
            listService.deleteList(listId);
            return ResponseEntity.ok(Map.of("message", "List deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}