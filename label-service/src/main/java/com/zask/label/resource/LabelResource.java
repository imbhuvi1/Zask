package com.zask.label.resource;

import com.zask.label.dto.*;
import com.zask.label.entity.*;
import com.zask.label.service.LabelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/labels")
@CrossOrigin(origins = "*")
public class LabelResource {

    @Autowired
    private LabelService labelService;

    // Label endpoints
    @PostMapping
    public ResponseEntity<?> createLabel(@RequestBody LabelRequest request) {
        try {
            return ResponseEntity.ok(labelService.createLabel(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<Label>> getLabelsByBoard(@PathVariable int boardId) {
        return ResponseEntity.ok(labelService.getLabelsByBoard(boardId));
    }

    @PutMapping("/{labelId}")
    public ResponseEntity<?> updateLabel(@PathVariable int labelId,
                                         @RequestBody LabelRequest request) {
        try {
            return ResponseEntity.ok(labelService.updateLabel(labelId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{labelId}")
    public ResponseEntity<?> deleteLabel(@PathVariable int labelId) {
        try {
            labelService.deleteLabel(labelId);
            return ResponseEntity.ok(Map.of("message", "Label deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/card/{cardId}/add/{labelId}")
    public ResponseEntity<?> addLabelToCard(@PathVariable int cardId,
                                            @PathVariable int labelId) {
        try {
            labelService.addLabelToCard(cardId, labelId);
            return ResponseEntity.ok(Map.of("message", "Label added to card"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/card/{cardId}/remove/{labelId}")
    public ResponseEntity<?> removeLabelFromCard(@PathVariable int cardId,
                                                 @PathVariable int labelId) {
        try {
            labelService.removeLabelFromCard(cardId, labelId);
            return ResponseEntity.ok(Map.of("message", "Label removed from card"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/card/{cardId}")
    public ResponseEntity<List<Label>> getLabelsForCard(@PathVariable int cardId) {
        return ResponseEntity.ok(labelService.getLabelsForCard(cardId));
    }

    // Checklist endpoints
    @PostMapping("/checklists")
    public ResponseEntity<?> createChecklist(@RequestBody ChecklistRequest request) {
        try {
            return ResponseEntity.ok(labelService.createChecklist(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/checklists/card/{cardId}")
    public ResponseEntity<List<Checklist>> getChecklistsByCard(@PathVariable int cardId) {
        return ResponseEntity.ok(labelService.getChecklistsByCard(cardId));
    }

    @PostMapping("/checklists/{checklistId}/items")
    public ResponseEntity<?> addItem(@PathVariable int checklistId,
                                     @RequestBody ChecklistItemRequest request) {
        try {
            return ResponseEntity.ok(labelService.addItem(checklistId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/checklists/items/{itemId}/toggle")
    public ResponseEntity<?> toggleItem(@PathVariable int itemId) {
        try {
            labelService.toggleItem(itemId);
            return ResponseEntity.ok(Map.of("message", "Item toggled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/checklists/{checklistId}")
    public ResponseEntity<?> deleteChecklist(@PathVariable int checklistId) {
        try {
            labelService.deleteChecklist(checklistId);
            return ResponseEntity.ok(Map.of("message", "Checklist deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/checklists/{checklistId}/progress")
    public ResponseEntity<?> getProgress(@PathVariable int checklistId) {
        return ResponseEntity.ok(Map.of("progress",
                labelService.getChecklistProgress(checklistId)));
    }
}