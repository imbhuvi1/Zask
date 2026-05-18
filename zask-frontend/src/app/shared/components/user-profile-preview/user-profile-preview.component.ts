import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfilePreviewService } from '../../../core/services/profile-preview.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-profile-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    @if (previewService.isOpen()) {
      <!-- Invisible backdrop to catch outside clicks -->
      <div class="fixed inset-0 z-[900]" (click)="close()"></div>

      <!-- Preview Card -->
      <div class="fixed z-[901] w-[260px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
           [style.left.px]="previewService.position().x"
           [style.top.px]="previewService.position().y"
           (click)="$event.stopPropagation()">

        @if (previewService.isLoading()) {
          <div class="flex justify-center items-center h-32">
            <mat-spinner diameter="28" color="primary"></mat-spinner>
          </div>
        } @else if (previewUser) {
          <!-- Header Banner with gradient -->
          <div class="h-16 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
            <div class="absolute -bottom-6 left-4 w-14 h-14 rounded-full border-4 border-white shadow-lg flex items-center justify-center font-bold text-lg text-white"
                 [style.background]="getAvatarColor(previewUser.userId || previewUser.id)">
              {{ getInitials(previewUser.fullName) }}
            </div>
          </div>

          <!-- Body -->
          <div class="pt-8 px-4 pb-4">
            <div class="mb-3">
              <div class="text-base font-bold text-slate-800 leading-tight">{{ previewUser.fullName || 'Unknown User' }}</div>
              <div class="text-xs text-slate-500 mt-0.5 truncate">{{ previewUser.email }}</div>
            </div>

            @if (previewUser.role) {
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold mb-3"
                   [ngClass]="getRoleBadgeClass(previewUser.role)">
                <mat-icon class="!text-[12px] !w-3 !h-3">{{ getRoleIcon(previewUser.role) }}</mat-icon>
                {{ formatRole(previewUser.role) }}
              </div>
            }

            <div class="flex items-center gap-1.5 text-[10px] mb-4">
              <mat-icon class="!text-[12px] !w-3 !h-3"
                        [ngClass]="previewUser.isActive || previewUser.active ? 'text-green-500' : 'text-slate-300'">circle</mat-icon>
              <span [ngClass]="previewUser.isActive || previewUser.active ? 'text-green-600 font-semibold' : 'text-slate-400'">
                {{ previewUser.isActive || previewUser.active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <button class="w-full py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                    (click)="viewProfile(previewUser.userId || previewUser.id)">
              View Full Profile
            </button>
          </div>
        } @else {
          <div class="p-6 text-center text-xs text-slate-400">
            <mat-icon class="!text-3xl !w-8 !h-8 opacity-30 mb-2">person_off</mat-icon>
            <div>User not found</div>
          </div>
        }
      </div>
    }
  `
})
export class UserProfilePreviewComponent {
  previewService = inject(ProfilePreviewService);
  private router = inject(Router);
  private authService = inject(AuthService);

  get previewUser(): User | null {
    return this.previewService.previewUser();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.previewService.close();
  }

  close(): void {
    this.previewService.close();
  }

  viewProfile(userId: number): void {
    this.previewService.close();
    const me = this.authService.currentUser();
    const myId = me?.userId || me?.id;
    if (myId === userId) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/user', userId]);
    }
  }

  getInitials(fullName: string | undefined): string {
    if (!fullName) return 'U';
    const parts = fullName.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return fullName.substring(0, 2).toUpperCase();
  }

  getAvatarColor(userId: number): string {
    const colors = [
      '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
      '#ef4444', '#ec4899', '#0ea5e9', '#84cc16', '#f97316'
    ];
    return colors[(userId || 0) % colors.length];
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'PLATFORM_ADMIN': return 'bg-red-50 text-red-700';
      case 'BOARD_ADMIN':
      case 'ADMIN': return 'bg-purple-50 text-purple-700';
      case 'MEMBER': return 'bg-blue-50 text-blue-700';
      default: return 'bg-slate-50 text-slate-600';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'PLATFORM_ADMIN': return 'shield';
      case 'BOARD_ADMIN':
      case 'ADMIN': return 'manage_accounts';
      default: return 'person';
    }
  }

  formatRole(role: string): string {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
}
