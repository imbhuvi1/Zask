export interface TaskList {
  listId: number;
  boardId: number;
  name: string;
  position: number;
  isArchived: boolean;
  createdAt?: string;
  updatedAt?: string;
}
