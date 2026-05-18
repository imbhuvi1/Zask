export type WorkspaceVisibility = 'PUBLIC' | 'PRIVATE';

export interface Workspace {
  workspaceId: number;
  name: string;
  description?: string;
  visibility?: WorkspaceVisibility;
  ownerId: number;
  createdAt?: string;
}

export interface WorkspaceMember {
  id: number;
  workspaceId: number;
  userId: number;
  role: string;
  joinedAt?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
}