export interface Board {
  boardId: number;
  workspaceId: number;
  name: string;
  description?: string;
  background?: string;
  visibility: string;
  createdById: number;
  isClosed: boolean;
  createdAt: string;
}
