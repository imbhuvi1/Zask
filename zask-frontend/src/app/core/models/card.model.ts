export interface Card {
  cardId: number;
  listId: number;
  boardId: number;
  title: string;
  description?: string;
  position: number;
  priority: string; // LOW, MEDIUM, HIGH, CRITICAL
  status: string;   // TO_DO, IN_PROGRESS, IN_REVIEW, DONE
  dueDate?: string;
  startDate?: string;
  assigneeId?: number;
  createdById: number;
  isArchived: boolean;
  coverColor?: string;
  createdAt?: string;
  updatedAt?: string;
}
