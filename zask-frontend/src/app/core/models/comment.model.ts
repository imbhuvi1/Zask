export interface Comment {
  commentId: number;
  cardId: number;
  authorId: number;
  authorName?: string; // Added for display
  content: string;
  parentCommentId?: number | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  likeCount?: number;
  dislikeCount?: number;
  isEdited?: boolean;
  reactions?: Reaction[];
  replies?: Comment[];
}

export interface Reaction {
  id: number;
  commentId: number;
  userId: number;
  emoji: string;
  createdAt: string;
}

export interface Attachment {
  attachmentId: number;
  cardId: number;
  uploaderId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  sizeKb: number;
  uploadedAt: string;
}
