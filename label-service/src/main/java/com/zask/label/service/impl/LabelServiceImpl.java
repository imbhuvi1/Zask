package com.zask.label.service.impl;

import com.zask.label.dto.*;
import com.zask.label.entity.*;
import com.zask.label.exception.ResourceNotFoundException;
import com.zask.label.exception.ValidationException;
import com.zask.label.repository.*;
import com.zask.label.service.LabelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LabelServiceImpl implements LabelService {

    @Autowired
    private LabelRepository labelRepository;

    @Autowired
    private CardLabelRepository cardLabelRepository;

    @Autowired
    private ChecklistRepository checklistRepository;

    @Autowired
    private ChecklistItemRepository checklistItemRepository;

    @Override
    public Label createLabel(LabelRequest request) {
        Label label = Label.builder()
                .boardId(request.getBoardId())
                .name(request.getName())
                .color(request.getColor())
                .build();
        return labelRepository.save(label);
    }

    @Override
    public List<Label> getLabelsByBoard(int boardId) {
        return labelRepository.findByBoardId(boardId);
    }

    @Override
    public Label updateLabel(int labelId, LabelRequest request) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Label not found"));
        if (request.getName() != null) label.setName(request.getName());
        if (request.getColor() != null) label.setColor(request.getColor());
        return labelRepository.save(label);
    }

    @Override
    @Transactional
    public void deleteLabel(int labelId) {
        labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Label not found"));
        cardLabelRepository.findByLabelId(labelId)
                .forEach(cl -> cardLabelRepository.delete(cl));
        labelRepository.deleteById(labelId);
    }

    @Override
    public void addLabelToCard(int cardId, int labelId) {
        if (cardLabelRepository.existsByCardIdAndLabelId(cardId, labelId))
            throw new ValidationException("Label already added to this card");
        CardLabel cardLabel = CardLabel.builder()
                .cardId(cardId)
                .labelId(labelId)
                .build();
        cardLabelRepository.save(cardLabel);
    }

    @Override
    @Transactional
    public void removeLabelFromCard(int cardId, int labelId) {
        cardLabelRepository.deleteByCardIdAndLabelId(cardId, labelId);
    }

    @Override
    public List<Label> getLabelsForCard(int cardId) {
        return cardLabelRepository.findByCardId(cardId).stream()
                .map(cl -> labelRepository.findById(cl.getLabelId()).orElse(null))
                .filter(l -> l != null)
                .collect(Collectors.toList());
    }

    @Override
    public Checklist createChecklist(ChecklistRequest request) {
        Checklist checklist = Checklist.builder()
                .cardId(request.getCardId())
                .title(request.getTitle())
                .position(request.getPosition())
                .build();
        Checklist saved = checklistRepository.save(checklist);
        saved.setItems(new java.util.ArrayList<>());
        return saved;
    }

    @Override
    public ChecklistItem addItem(int checklistId, ChecklistItemRequest request) {
        checklistRepository.findById(checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found"));
        ChecklistItem item = ChecklistItem.builder()
                .checklistId(checklistId)
                .text(request.getText())
                .assigneeId(request.getAssigneeId())
                .dueDate(request.getDueDate())
                .build();
        return checklistItemRepository.save(item);
    }

    @Override
    public void toggleItem(int itemId) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
        item.setCompleted(!item.isCompleted());
        checklistItemRepository.save(item);
    }

    @Override
    @Transactional
    public void deleteChecklist(int checklistId) {
        checklistRepository.findById(checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found"));
        checklistItemRepository.findByChecklistId(checklistId)
                .forEach(item -> checklistItemRepository.delete(item));
        checklistRepository.deleteById(checklistId);
    }

    @Override
    public List<Checklist> getChecklistsByCard(int cardId) {
        List<Checklist> checklists = checklistRepository.findByCardId(cardId);
        for (Checklist cl : checklists) {
            cl.setItems(checklistItemRepository.findByChecklistId(cl.getChecklistId()));
        }
        return checklists;
    }

    @Override
    public int getChecklistProgress(int checklistId) {
        long total = checklistItemRepository.countByChecklistId(checklistId);
        if (total == 0) return 0;
        long completed = checklistItemRepository.countByChecklistIdAndIsCompleted(checklistId, true);
        return (int) ((completed * 100) / total);
    }

    @Override
    public Checklist updateChecklist(int checklistId, ChecklistRequest request) {
        Checklist checklist = checklistRepository.findById(checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found"));
        if (request.getTitle() != null) {
            checklist.setTitle(request.getTitle());
        }
        Checklist saved = checklistRepository.save(checklist);
        saved.setItems(checklistItemRepository.findByChecklistId(saved.getChecklistId()));
        return saved;
    }

    @Override
    public ChecklistItem updateItem(int itemId, ChecklistItemRequest request) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
        if (request.getText() != null) {
            item.setText(request.getText());
        }
        if (request.getAssigneeId() > 0) {
            item.setAssigneeId(request.getAssigneeId());
        }
        if (request.getDueDate() != null) {
            item.setDueDate(request.getDueDate());
        }
        return checklistItemRepository.save(item);
    }

    @Override
    @Transactional
    public void deleteItem(int itemId) {
        checklistItemRepository.deleteById(itemId);
    }
}
