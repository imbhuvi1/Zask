import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-[#172b4d] mb-2">Platform Broadcast</h1>
        <p class="text-gray-500">Send instant notifications to all users or specific groups.</p>
      </div>

      <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div class="space-y-6">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Audience</label>
            <div class="flex gap-4">
              <button *ngFor="let target of targets" 
                      (click)="selectedTarget.set(target)"
                      [class]="selectedTarget() === target ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                      class="px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1">
                {{ target }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notification Title</label>
            <input type="text" [(ngModel)]="title" 
                   placeholder="e.g. Scheduled Maintenance"
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message Content</label>
            <textarea [(ngModel)]="message" rows="5"
                      placeholder="Enter the broadcast message here..."
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Priority Type</label>
            <div class="flex gap-3">
              <button *ngFor="let type of types" 
                      (click)="selectedType.set(type.value)"
                      [class]="selectedType() === type.value ? type.activeClass : 'bg-gray-50 text-gray-500'"
                      class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-transparent">
                <mat-icon class="!text-[16px] !w-4 !h-4">{{ type.icon }}</mat-icon>
                {{ type.label }}
              </button>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-50 flex items-center justify-end gap-3">
            <button mat-button class="!text-gray-500" (click)="clear()">Clear</button>
            <button mat-flat-button color="primary" 
                    [disabled]="!title || !message || isSending"
                    (click)="send()">
              <mat-icon *ngIf="!isSending" class="!text-[18px] !w-[18px] !h-[18px]">send</mat-icon>
              <span *ngIf="isSending">Sending...</span>
              <span *ngIf="!isSending">Send Broadcast</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-blue-50 rounded-xl p-4 flex gap-4">
        <mat-icon class="text-blue-600 shrink-0">info</mat-icon>
        <p class="text-xs text-blue-700 leading-relaxed">
          <strong>Note:</strong> Broadcasts are delivered instantly to all active user dashboards. Users will see this as a high-priority notification in their activity feed.
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AdminBroadcastComponent {
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  title = '';
  message = '';
  isSending = false;

  targets = ['ALL USERS', 'ADMINS ONLY', 'ACTIVE TEAMS'];
  selectedTarget = signal('ALL USERS');

  selectedType = signal('INFO');
  types = [
    { label: 'Information', value: 'INFO', icon: 'info', activeClass: 'bg-blue-100 text-blue-700 border-blue-200' },
    { label: 'Success/Update', value: 'SUCCESS', icon: 'check_circle', activeClass: 'bg-green-100 text-green-700 border-green-200' },
    { label: 'Critical Warning', value: 'WARNING', icon: 'warning', activeClass: 'bg-amber-100 text-amber-700 border-amber-200' },
    { label: 'System Alert', value: 'ALERT', icon: 'report_problem', activeClass: 'bg-red-100 text-red-700 border-red-200' }
  ];

  send() {
    this.isSending = true;
    this.adminService.sendBroadcast({
      title: this.title,
      message: this.message,
      type: this.selectedType()
    }).subscribe({
      next: () => {
        this.snackBar.open('Broadcast sent successfully!', 'Dismiss', { duration: 3000 });
        this.clear();
        this.isSending = false;
      },
      error: () => {
        this.snackBar.open('Failed to send broadcast.', 'Dismiss', { duration: 3000 });
        this.isSending = false;
      }
    });
  }

  clear() {
    this.title = '';
    this.message = '';
    this.selectedTarget.set('ALL USERS');
    this.selectedType.set('INFO');
  }
}
