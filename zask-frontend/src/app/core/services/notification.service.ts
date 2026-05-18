import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Notification } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  getByRecipient(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/recipient/${userId}`);
  }

  createNotification(notification: any): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification);
  }

  // Real-time broadcast to ALL users (recipientId = -1)
  sendBroadcast(data: { title: string, message: string, type: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/broadcast`, data);
  }

  // Send to multiple specific users (Bulk)
  sendBulk(recipientIds: number[], notification: any): Observable<any> {
    const payload = {
      recipientIds: recipientIds,
      title: notification.title || 'Notification',
      message: notification.message,
      type: notification.type || 'SYSTEM'
    };
    return this.http.post(`${this.apiUrl}/bulk`, payload);
  }

  // Compatibility method for existing components
  broadcastNotification(userIds: number[], notification: any): void {
    if (userIds.length === 0) return;
    this.sendBulk(userIds, notification).subscribe();
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/unread/${userId}`).pipe(
      map(res => res.unreadCount)
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all/${userId}`, {});
  }

  deleteRead(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/read/${userId}`);
  }

  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }

  clearAllNotifications(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/recipient/${userId}`);
  }
}
