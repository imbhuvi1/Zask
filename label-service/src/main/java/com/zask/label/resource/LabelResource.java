package com.zask.label.resource;

import com.zask.label.dto.*;
import com.zask.label.entity.*;
import com.zask.label.service.LabelService;
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
@RequestMapping("/api/v1/labels")
@CrossOrigin(origins = "*")
@Tag(name = "Label & Checklist Management", description = "Endpoints for creating labels, adding them to cards, and managing checklists and items")
public class LabelResource {

    @Autowired
    private LabelService labelService;

    // Label endpoints
    @PostMapping
    @Operation(summary = "Create a board label", description = "Creates a label with boardId, name, and background color.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Label created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request details")
    })
    public ResponseEntity<?> createLabel(@Valid @RequestBody LabelRequest request) {
        try {
            return ResponseEntity.ok(labelService.createLabel(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/board/{boardId}")
    @Operation(summary = "Get board labels", description = "Retrieves all labels defined in the board.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Labels retrieved successfully")
    })
    public ResponseEntity<List<Label>> getLabelsByBoard(@PathVariable int boardId) {
        return ResponseEntity.ok(labelService.getLabelsByBoard(boardId));
    }

    @PutMapping("/{labelId}")
    @Operation(summary = "Update label details", description = "Updates fields of a board label.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Label updated successfully"),
        @ApiResponse(responseCode = "404", description = "Label not found")
    })
    public ResponseEntity<?> updateLabel(@PathVariable int labelId,
                                         @Valid @RequestBody LabelRequest request) {
        try {
            return ResponseEntity.ok(labelService.updateLabel(labelId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{labelId}")
    @Operation(summary = "Delete label", description = "Permanently deletes a board label and detaches it from all cards.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Label deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Label not found")
    })
    public ResponseEntity<?> deleteLabel(@PathVariable int labelId) {
        try {
            labelService.deleteLabel(labelId);
            return ResponseEntity.ok(Map.of("message", "Label deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/card/{cardId}/add/{labelId}")
    @Operation(summary = "Attach label to card", description = "Links a board label to a card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Label attached successfully"),
        @ApiResponse(responseCode = "400", description = "Label already attached"),
        @ApiResponse(responseCode = "404", description = "Label not found")
    })
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
    @Operation(summary = "Detach label from card", description = "Removes the label link from the card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Label detached successfully")
    })
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
    @Operation(summary = "Get card labels", description = "Retrieves all labels attached to the card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Labels retrieved successfully")
    })
    public ResponseEntity<List<Label>> getLabelsForCard(@PathVariable int cardId) {
        return ResponseEntity.ok(labelService.getLabelsForCard(cardId));
    }

    // Checklist endpoints
    @PostMapping("/checklists")
    @Operation(summary = "Create a new checklist", description = "Creates a checklist inside a card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Checklist created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request details")
    })
    public ResponseEntity<?> createChecklist(@RequestBody ChecklistRequest request) {
        try {
            return ResponseEntity.ok(labelService.createChecklist(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/checklists/card/{cardId}")
    @Operation(summary = "Get card checklists", description = "Retrieves all checklists and their items belonging to a card.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Checklists retrieved successfully")
    })
    public ResponseEntity<List<Checklist>> getChecklistsByCard(@PathVariable int cardId) {
        return ResponseEntity.ok(labelService.getChecklistsByCard(cardId));
    }

    @PostMapping("/checklists/{checklistId}/items")
    @Operation(summary = "Add checklist item", description = "Appends a new checklist item to a checklist.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item added successfully"),
        @ApiResponse(responseCode = "404", description = "Checklist not found")
    })
    public ResponseEntity<?> addItem(@PathVariable int checklistId,
                                     @RequestBody ChecklistItemRequest request) {
        try {
            return ResponseEntity.ok(labelService.addItem(checklistId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/checklists/items/{itemId}/toggle")
    @Operation(summary = "Toggle checklist item completion", description = "Toggles completed status of a checklist item.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item toggled successfully"),
        @ApiResponse(responseCode = "404", description = "Checklist item not found")
    })
    public ResponseEntity<?> toggleItem(@PathVariable int itemId) {
        try {
            labelService.toggleItem(itemId);
            return ResponseEntity.ok(Map.of("message", "Item toggled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/checklists/{checklistId}")
    @Operation(summary = "Delete checklist", description = "Permanently deletes a checklist and its items.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Checklist deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Checklist not found")
    })
    public ResponseEntity<?> deleteChecklist(@PathVariable int checklistId) {
        try {
            labelService.deleteChecklist(checklistId);
            return ResponseEntity.ok(Map.of("message", "Checklist deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/checklists/{checklistId}/progress")
    @Operation(summary = "Get checklist progress", description = "Calculates completion percentage of the checklist.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Checklist progress returned")
    })
    public ResponseEntity<?> getProgress(@PathVariable int checklistId) {
        return ResponseEntity.ok(Map.of("progress",
                labelService.getChecklistProgress(checklistId)));
    }

    @PutMapping("/checklists/{checklistId}")
    @Operation(summary = "Update checklist title", description = "Updates the title of a checklist.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Checklist updated successfully"),
        @ApiResponse(responseCode = "404", description = "Checklist not found")
    })
    public ResponseEntity<?> updateChecklist(@PathVariable int checklistId,
                                             @RequestBody ChecklistRequest request) {
        try {
            return ResponseEntity.ok(labelService.updateChecklist(checklistId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/checklists/items/{itemId}")
    @Operation(summary = "Update checklist item", description = "Updates details like title, assignee, or due date of an item.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item updated successfully"),
        @ApiResponse(responseCode = "404", description = "Checklist item not found")
    })
    public ResponseEntity<?> updateItem(@PathVariable int itemId,
                                         @RequestBody ChecklistItemRequest request) {
        try {
            return ResponseEntity.ok(labelService.updateItem(itemId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/checklists/items/{itemId}")
    @Operation(summary = "Delete checklist item", description = "Permanently deletes a checklist item.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Checklist item not found")
    })
    public ResponseEntity<?> deleteItem(@PathVariable int itemId) {
        try {
            labelService.deleteItem(itemId);
            return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}