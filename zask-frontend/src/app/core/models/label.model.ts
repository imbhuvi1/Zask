export interface Label {
  labelId: number;
  boardId: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface Checklist {
  checklistId: number;
  cardId: number;
  title: string;
  position: number;
  createdAt: string;
  items?: ChecklistItem[]; // Frontend convenience
}

export interface ChecklistItem {
  itemId: number;
  checklistId: number;
  text: string;
  isCompleted: boolean;
  assigneeId?: number | null;
  dueDate?: string | null;
}
