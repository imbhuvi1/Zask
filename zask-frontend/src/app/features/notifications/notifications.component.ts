import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  notifications: Notification[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    const user = this.authService.currentUser();
    if (user?.userId) {
      this.loading = true;
      this.notificationService.getByRecipient(user.userId).subscribe({
        next: (data) => {
          this.notifications = data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  markAsRead(notification: Notification) {
    if (notification.isRead) return;
    this.notificationService.markAsRead(notification.notificationId).subscribe(() => {
      notification.isRead = true;
      // Emit event or rely on polling/nav badge refresh
    });
  }

  markAllAsRead() {
    const user = this.authService.currentUser();
    if (user?.userId) {
      this.notificationService.markAllAsRead(user.userId).subscribe(() => {
        this.notifications.forEach(n => n.isRead = true);
      });
    }
  }

  clearRead() {
    const user = this.authService.currentUser();
    if (user?.userId) {
      this.notificationService.deleteRead(user.userId).subscribe(() => {
        this.notifications = this.notifications.filter(n => !n.isRead);
      });
    }
  }
}
