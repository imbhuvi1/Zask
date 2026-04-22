package com.zask.list.resource;

import com.zask.list.dto.*;
import com.zask.list.entity.TaskList;
import com.zask.list.service.ListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/lists")
@CrossOrigin(origins = "*")
public class ListResource {

    @Autowired
    private ListService listService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ListRequest request) {
        try {
            return ResponseEntity.ok(listService.createList(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{listId}")
    public ResponseEntity<?> getById(@PathVariable int listId) {
        try {
            return ResponseEntity.ok(listService.getListById(listId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<TaskList>> getByBoard(@PathVariable int boardId) {
        return ResponseEntity.ok(listService.getListsByBoard(boardId));
    }

    @GetMapping("/board/{boardId}/archived")
    public ResponseEntity<List<TaskList>> getArchived(@PathVariable int boardId) {
        return ResponseEntity.ok(listService.getArchivedLists(boardId));
    }

    @PutMapping("/{listId}")
    public ResponseEntity<?> update(@PathVariable int listId,
                                    @RequestBody ListRequest request) {
        try {
            return ResponseEntity.ok(listService.updateList(listId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/board/{boardId}/reorder")
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
    public ResponseEntity<?> archive(@PathVariable int listId) {
        try {
            listService.archiveList(listId);
            return ResponseEntity.ok(Map.of("message", "List archived successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{listId}/unarchive")
    public ResponseEntity<?> unarchive(@PathVariable int listId) {
        try {
            listService.unarchiveList(listId);
            return ResponseEntity.ok(Map.of("message", "List unarchived successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{listId}/move/{targetBoardId}")
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
    public ResponseEntity<?> delete(@PathVariable int listId) {
        try {
            listService.deleteList(listId);
            return ResponseEntity.ok(Map.of("message", "List deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}