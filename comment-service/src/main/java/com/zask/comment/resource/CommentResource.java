package com.zask.comment.resource;

import com.zask.comment.dto.*;
import com.zask.comment.entity.*;
import com.zask.comment.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/comments")
@CrossOrigin(origins = "*")
public class CommentResource {

    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody CommentRequest request) {
        try {
            return ResponseEntity.ok(commentService.addComment(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/card/{cardId}")
    public ResponseEntity<List<Comment>> getByCard(@PathVariable int cardId) {
        return ResponseEntity.ok(commentService.getByCard(cardId));
    }

    @GetMapping("/{commentId}")
    public ResponseEntity<?> getById(@PathVariable int commentId) {
        try {
            return ResponseEntity.ok(commentService.getCommentById(commentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{commentId}/replies")
    public ResponseEntity<List<Comment>> getReplies(@PathVariable int commentId) {
        return ResponseEntity.ok(commentService.getReplies(commentId));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<?> update(@PathVariable int commentId,
                                    @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(
                commentService.updateComment(commentId, body.get("content")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> delete(@PathVariable int commentId) {
        try {
            commentService.deleteComment(commentId);
            return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/card/{cardId}/count")
    public ResponseEntity<?> getCount(@PathVariable int cardId) {
        return ResponseEntity.ok(Map.of("count", commentService.getCommentCount(cardId)));
    }

    // Attachment endpoints
    @PostMapping("/attachments")
    public ResponseEntity<?> addAttachment(@RequestBody AttachmentRequest request) {
        try {
            return ResponseEntity.ok(commentService.addAttachment(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attachments/card/{cardId}")
    public ResponseEntity<List<Attachment>> getAttachments(@PathVariable int cardId) {
        return ResponseEntity.ok(commentService.getAttachmentsByCard(cardId));
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(@PathVariable int attachmentId) {
        try {
            commentService.deleteAttachment(attachmentId);
            return ResponseEntity.ok(Map.of("message", "Attachment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}