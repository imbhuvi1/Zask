export interface Notification {
  notificationId: number;
  recipientId: number;
  actorId: number;
  type: string;
  message: string;
  title: string;
  relatedId: number;
  relatedType: string;
  isRead: boolean;
  createdAt: string;
}
