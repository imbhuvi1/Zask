package com.zask.board.resource;

import com.zask.board.dto.*;
import com.zask.board.entity.*;
import com.zask.board.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/boards")
@CrossOrigin(origins = "*")
public class BoardResource {

    @Autowired
    private BoardService boardService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody BoardRequest request) {
        try {
            return ResponseEntity.ok(boardService.createBoard(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<?> getById(@PathVariable int boardId) {
        try {
            return ResponseEntity.ok(boardService.getBoardById(boardId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<Board>> getByWorkspace(@PathVariable int workspaceId) {
        return ResponseEntity.ok(boardService.getBoardsByWorkspace(workspaceId));
    }

    @GetMapping("/member/{userId}")
    public ResponseEntity<List<Board>> getByMember(@PathVariable int userId) {
        return ResponseEntity.ok(boardService.getBoardsByMember(userId));
    }

    @PutMapping("/{boardId}")
    public ResponseEntity<?> update(@PathVariable int boardId,
                                    @RequestBody BoardRequest request) {
        try {
            return ResponseEntity.ok(boardService.updateBoard(boardId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{boardId}/close")
    public ResponseEntity<?> close(@PathVariable int boardId) {
        try {
            boardService.closeBoard(boardId);
            return ResponseEntity.ok(Map.of("message", "Board closed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<?> delete(@PathVariable int boardId) {
        try {
            boardService.deleteBoard(boardId);
            return ResponseEntity.ok(Map.of("message", "Board deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{boardId}/members")
    public ResponseEntity<?> addMember(@PathVariable int boardId,
                                       @RequestBody BoardMemberRequest request) {
        try {
            return ResponseEntity.ok(boardService.addMember(boardId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{boardId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable int boardId,
                                          @PathVariable int userId) {
        try {
            boardService.removeMember(boardId, userId);
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{boardId}/members/{userId}")
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
    public ResponseEntity<List<BoardMember>> getMembers(@PathVariable int boardId) {
        return ResponseEntity.ok(boardService.getMembers(boardId));
    }
}