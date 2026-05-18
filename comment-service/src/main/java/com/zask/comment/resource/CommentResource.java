package com.zask.comment.resource;

import com.zask.comment.dto.*;
import com.zask.comment.entity.*;
import com.zask.comment.service.CommentService;
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
@RequestMapping("/api/v1/comments")
@CrossOrigin(origins = "*")
@Tag(name = "Comment & Attachment Management", description = "Endpoints for posting comments, uploading attachments, like/reaction management")
public class CommentResource {

    @Autowired
    private CommentService commentService;

    @PostMapping
    @Operation(summary = "Add a comment", description = "Creates a comment or reply on a card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comment posted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request details")
    })
    public ResponseEntity<?> addComment(@Valid @RequestBody CommentRequest request) {
        try {
            return ResponseEntity.ok(commentService.addComment(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/card/{cardId}")
    @Operation(summary = "Get card comments", description = "Retrieves all comments belonging to a card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comments retrieved successfully")
    })
    public ResponseEntity<List<Comment>> getByCard(@PathVariable int cardId) {
        return ResponseEntity.ok(commentService.getByCard(cardId));
    }

    @GetMapping("/{commentId}")
    @Operation(summary = "Get comment by ID", description = "Retrieves a comment by unique comment ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comment found"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    public ResponseEntity<?> getById(@PathVariable int commentId) {
        try {
            return ResponseEntity.ok(commentService.getCommentById(commentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{commentId}/replies")
    @Operation(summary = "Get comment replies", description = "Retrieves all nested replies for a given comment.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Replies retrieved successfully")
    })
    public ResponseEntity<List<Comment>> getReplies(@PathVariable int commentId) {
        return ResponseEntity.ok(commentService.getReplies(commentId));
    }

    @PutMapping("/{commentId}")
    @Operation(summary = "Update comment content", description = "Modifies text content of an existing comment.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comment updated successfully"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
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
    @Operation(summary = "Delete comment", description = "Permanently deletes a comment and all its nested replies.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comment deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    public ResponseEntity<?> delete(@PathVariable int commentId) {
        try {
            commentService.deleteComment(commentId);
            return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/card/{cardId}/count")
    @Operation(summary = "Get comments count", description = "Retrieves total count of comments for a card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comments count returned")
    })
    public ResponseEntity<?> getCount(@PathVariable int cardId) {
        return ResponseEntity.ok(Map.of("count", commentService.getCommentCount(cardId)));
    }

    // Attachment endpoints
    @PostMapping("/attachments")
    @Operation(summary = "Add attachment", description = "Links a file or link attachment to a card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Attachment linked successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid attachment details")
    })
    public ResponseEntity<?> addAttachment(@Valid @RequestBody AttachmentRequest request) {
        try {
            return ResponseEntity.ok(commentService.addAttachment(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attachments/card/{cardId}")
    @Operation(summary = "Get card attachments", description = "Retrieves all attachments linked to a card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Attachments retrieved successfully")
    })
    public ResponseEntity<List<Attachment>> getAttachments(@PathVariable int cardId) {
        return ResponseEntity.ok(commentService.getAttachmentsByCard(cardId));
    }

    @DeleteMapping("/attachments/{attachmentId}")
    @Operation(summary = "Delete attachment", description = "Permanently deletes an attachment link.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Attachment deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Attachment not found")
    })
    public ResponseEntity<?> deleteAttachment(@PathVariable int attachmentId) {
        try {
            commentService.deleteAttachment(attachmentId);
            return ResponseEntity.ok(Map.of("message", "Attachment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{commentId}/like")
    @Operation(summary = "Like comment", description = "Increases like count of a comment.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Like registered successfully"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    public ResponseEntity<?> likeComment(@PathVariable int commentId) {
        try {
            return ResponseEntity.ok(commentService.likeComment(commentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{commentId}/reactions")
    @Operation(summary = "Get comment reactions", description = "Retrieves all reactions (emojis) for a comment.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reactions retrieved successfully")
    })
    public ResponseEntity<List<Reaction>> getReactions(@PathVariable int commentId) {
        return ResponseEntity.ok(commentService.getReactions(commentId));
    }

    @PostMapping("/{commentId}/reactions")
    @Operation(summary = "Add comment reaction", description = "Registers an emoji reaction for a user on a comment.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reaction added successfully"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    public ResponseEntity<?> addReaction(@PathVariable int commentId, @RequestBody Map<String, Object> body) {
        try {
            int userId = Integer.parseInt(body.get("userId").toString());
            String emoji = body.get("emoji").toString();
            return ResponseEntity.ok(commentService.addReaction(commentId, userId, emoji));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{commentId}/reactions")
    @Operation(summary = "Remove comment reaction", description = "Removes a user's emoji reaction from a comment.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reaction removed successfully")
    })
    public ResponseEntity<?> removeReaction(@PathVariable int commentId, 
                                            @RequestParam int userId, 
                                            @RequestParam String emoji) {
        try {
            commentService.removeReaction(commentId, userId, emoji);
            return ResponseEntity.ok(Map.of("message", "Reaction removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}