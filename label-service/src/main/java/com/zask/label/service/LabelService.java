package com.zask.label.service;

import com.zask.label.dto.*;
import com.zask.label.entity.*;
import java.util.List;

public interface LabelService {
    Label createLabel(LabelRequest request);
    List<Label> getLabelsByBoard(int boardId);
    Label updateLabel(int labelId, LabelRequest request);
    void deleteLabel(int labelId);
    void addLabelToCard(int cardId, int labelId);
    void removeLabelFromCard(int cardId, int labelId);
    List<Label> getLabelsForCard(int cardId);
    Checklist createChecklist(ChecklistRequest request);
    ChecklistItem addItem(int checklistId, ChecklistItemRequest request);
    void toggleItem(int itemId);
    void deleteChecklist(int checklistId);
    List<Checklist> getChecklistsByCard(int cardId);
    int getChecklistProgress(int checklistId);
}