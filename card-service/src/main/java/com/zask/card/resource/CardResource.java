package com.zask.card.resource;

import com.zask.card.dto.*;
import com.zask.card.entity.Card;
import com.zask.card.entity.CardMember;
import com.zask.card.service.CardService;
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
@RequestMapping("/api/v1/cards")
@CrossOrigin(origins = "*")
@Tag(name = "Card Management", description = "Endpoints for creating, updating, deleting, archiving, moving, and assigning members to kanban cards")
public class CardResource {

    @Autowired
    private CardService cardService;

    @PostMapping
    @Operation(summary = "Create a new card", description = "Creates a card with details like listId, title, description, cover image, priority, and dates.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Card created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request details")
    })
    public ResponseEntity<?> create(@Valid @RequestBody CardRequest request) {
        try {
            return ResponseEntity.ok(cardService.createCard(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{cardId}")
    @Operation(summary = "Get card by ID", description = "Retrieves card details by unique card ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Card found"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> getById(@PathVariable int cardId) {
        try {
            return ResponseEntity.ok(cardService.getCardById(cardId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/list/{listId}")
    @Operation(summary = "Get cards by list", description = "Retrieves all active cards that belong to the given task list.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cards retrieved successfully")
    })
    public ResponseEntity<List<Card>> getByList(@PathVariable int listId) {
        return ResponseEntity.ok(cardService.getCardsByList(listId));
    }

    @GetMapping("/board/{boardId}")
    @Operation(summary = "Get cards by board", description = "Retrieves all active cards belonging to a board.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cards retrieved successfully")
    })
    public ResponseEntity<List<Card>> getByBoard(@PathVariable int boardId) {
        return ResponseEntity.ok(cardService.getCardsByBoard(boardId));
    }

    @GetMapping("/assignee/{assigneeId}")
    @Operation(summary = "Get cards by assignee", description = "Retrieves all active cards assigned to a specific user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cards retrieved successfully")
    })
    public ResponseEntity<List<Card>> getByAssignee(@PathVariable int assigneeId) {
        return ResponseEntity.ok(cardService.getCardsByAssignee(assigneeId));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get all overdue cards", description = "Retrieves all active cards where the due date is in the past and the card is not completed.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Overdue cards retrieved successfully")
    })
    public ResponseEntity<List<Card>> getOverdue() {
        return ResponseEntity.ok(cardService.getOverdueCards());
    }

    @GetMapping("/search")
    @Operation(summary = "Search cards by title", description = "Searches for cards whose titles match the search string.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search results returned successfully")
    })
    public ResponseEntity<List<Card>> search(@RequestParam String title) {
        return ResponseEntity.ok(cardService.searchCards(title));
    }

    @GetMapping("/archived/user/{userId}")
    @Operation(summary = "Get archived cards by user", description = "Retrieves all archived cards that were archived by a specific user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Archived cards retrieved successfully")
    })
    public ResponseEntity<List<Card>> getArchivedByUser(@PathVariable int userId) {
        return ResponseEntity.ok(cardService.getArchivedCards(userId));
    }

    @PutMapping("/{cardId}")
    @Operation(summary = "Update card details", description = "Updates details like title, description, cover image, priority, or dates of an existing card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Card updated successfully"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> update(@PathVariable int cardId,
                                    @Valid @RequestBody CardRequest request) {
        try {
            return ResponseEntity.ok(cardService.updateCard(cardId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/move")
    @Operation(summary = "Move card", description = "Moves a card to a different list, board, or target position index.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Card moved successfully"),
        @ApiResponse(responseCode = "404", description = "Card or target list/board not found")
    })
    public ResponseEntity<?> move(@PathVariable int cardId,
                                  @RequestBody MoveCardRequest request) {
        try {
            return ResponseEntity.ok(cardService.moveCard(cardId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/list/{listId}/reorder")
    @Operation(summary = "Reorder cards inside list", description = "Sets new positions of all cards in a list.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cards reordered successfully")
    })
    public ResponseEntity<?> reorder(@PathVariable int listId,
                                     @RequestBody ReorderCardRequest request) {
        try {
            cardService.reorderCards(listId, request);
            return ResponseEntity.ok(Map.of("message", "Cards reordered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/assignee/{assigneeId}")
    @Operation(summary = "Set card assignee", description = "Assigns the card to a specific user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assignee updated successfully"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> setAssignee(@PathVariable int cardId,
                                         @PathVariable int assigneeId) {
        try {
            return ResponseEntity.ok(cardService.setAssignee(cardId, assigneeId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/priority")
    @Operation(summary = "Set card priority", description = "Sets priority (e.g. LOW, MEDIUM, HIGH, URGENT).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Priority updated successfully"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> setPriority(@PathVariable int cardId,
                                         @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(cardService.setPriority(cardId, body.get("priority")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/status")
    @Operation(summary = "Set card completion status", description = "Marks a card as completed or active.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status updated successfully"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> setStatus(@PathVariable int cardId,
                                       @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(cardService.setStatus(cardId, body.get("status")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/dates")
    @Operation(summary = "Set card dates", description = "Sets start date and due date of the card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dates updated successfully"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> setDates(@PathVariable int cardId,
                                      @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(cardService.setDates(cardId, body.get("startDate"), body.get("dueDate")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/archive")
    @Operation(summary = "Archive card", description = "Archives a card, removing it from active lists.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Card archived successfully"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> archive(@PathVariable int cardId) {
        try {
            cardService.archiveCard(cardId);
            return ResponseEntity.ok(Map.of("message", "Card archived successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/unarchive")
    @Operation(summary = "Unarchive card", description = "Restores an archived card to its list.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Card unarchived successfully"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> unarchive(@PathVariable int cardId) {
        try {
            cardService.unarchiveCard(cardId);
            return ResponseEntity.ok(Map.of("message", "Card unarchived successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{cardId}/cover")
    @Operation(summary = "Remove card cover image", description = "Removes the cover image styling from a card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cover removed successfully"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> removeCover(@PathVariable int cardId) {
        try {
            cardService.removeCover(cardId);
            return ResponseEntity.ok(Map.of("message", "Cover removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{cardId}")
    @Operation(summary = "Delete card permanently", description = "Permanently deletes a card and all its sub-resources.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Card deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> delete(@PathVariable int cardId) {
        try {
            cardService.deleteCard(cardId);
            return ResponseEntity.ok(Map.of("message", "Card deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{cardId}/members")
    @Operation(summary = "Get card assigned members", description = "Retrieves all members assigned to the card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Members retrieved successfully")
    })
    public ResponseEntity<List<CardMember>> getMembers(@PathVariable int cardId) {
        return ResponseEntity.ok(cardService.getCardMembers(cardId));
    }

    @PostMapping("/{cardId}/members/{userId}")
    @Operation(summary = "Add member to card", description = "Assigns an additional member to a card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Member added successfully"),
        @ApiResponse(responseCode = "400", description = "User is already assigned to the card"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<?> addMember(@PathVariable int cardId, @PathVariable int userId) {
        try {
            return ResponseEntity.ok(cardService.addCardMember(cardId, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{cardId}/members/{userId}")
    @Operation(summary = "Remove member from card", description = "Removes a member's assignment from the card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Member removed successfully")
    })
    public ResponseEntity<?> removeMember(@PathVariable int cardId, @PathVariable int userId) {
        try {
            cardService.removeCardMember(cardId, userId);
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}