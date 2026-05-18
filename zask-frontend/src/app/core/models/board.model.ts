export interface Board {
  boardId: number;
  workspaceId: number;
  name: string;
  description?: string;
  background?: string;
  visibility: string;
  createdById: number;
  isClosed: boolean;
  isStarred?: boolean;
  createdAt: string;
}

export interface BoardMember {
  memberId: number;
  boardId: number;
  userId: number;
  role: string;
  joinedAt: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
}
