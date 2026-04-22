package com.zask.card.resource;

import com.zask.card.dto.*;
import com.zask.card.entity.Card;
import com.zask.card.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cards")
@CrossOrigin(origins = "*")
public class CardResource {

    @Autowired
    private CardService cardService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CardRequest request) {
        try {
            return ResponseEntity.ok(cardService.createCard(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{cardId}")
    public ResponseEntity<?> getById(@PathVariable int cardId) {
        try {
            return ResponseEntity.ok(cardService.getCardById(cardId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/list/{listId}")
    public ResponseEntity<List<Card>> getByList(@PathVariable int listId) {
        return ResponseEntity.ok(cardService.getCardsByList(listId));
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<Card>> getByBoard(@PathVariable int boardId) {
        return ResponseEntity.ok(cardService.getCardsByBoard(boardId));
    }

    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<Card>> getByAssignee(@PathVariable int assigneeId) {
        return ResponseEntity.ok(cardService.getCardsByAssignee(assigneeId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Card>> getOverdue() {
        return ResponseEntity.ok(cardService.getOverdueCards());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Card>> search(@RequestParam String title) {
        return ResponseEntity.ok(cardService.searchCards(title));
    }

    @PutMapping("/{cardId}")
    public ResponseEntity<?> update(@PathVariable int cardId,
                                    @RequestBody CardRequest request) {
        try {
            return ResponseEntity.ok(cardService.updateCard(cardId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/move")
    public ResponseEntity<?> move(@PathVariable int cardId,
                                  @RequestBody MoveCardRequest request) {
        try {
            return ResponseEntity.ok(cardService.moveCard(cardId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/list/{listId}/reorder")
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
    public ResponseEntity<?> setAssignee(@PathVariable int cardId,
                                         @PathVariable int assigneeId) {
        try {
            return ResponseEntity.ok(cardService.setAssignee(cardId, assigneeId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/priority")
    public ResponseEntity<?> setPriority(@PathVariable int cardId,
                                         @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(cardService.setPriority(cardId, body.get("priority")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/status")
    public ResponseEntity<?> setStatus(@PathVariable int cardId,
                                       @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(cardService.setStatus(cardId, body.get("status")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/archive")
    public ResponseEntity<?> archive(@PathVariable int cardId) {
        try {
            cardService.archiveCard(cardId);
            return ResponseEntity.ok(Map.of("message", "Card archived successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{cardId}/unarchive")
    public ResponseEntity<?> unarchive(@PathVariable int cardId) {
        try {
            cardService.unarchiveCard(cardId);
            return ResponseEntity.ok(Map.of("message", "Card unarchived successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<?> delete(@PathVariable int cardId) {
        try {
            cardService.deleteCard(cardId);
            return ResponseEntity.ok(Map.of("message", "Card deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}