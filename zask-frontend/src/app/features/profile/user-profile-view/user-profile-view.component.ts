import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-profile-view',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50/50 font-sans pb-16">
      <!-- Back Button -->
      <div class="max-w-2xl mx-auto px-4 pt-8">
        <button (click)="goBack()"
                class="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-semibold transition-colors group">
          <mat-icon class="!text-[18px] !w-[18px] !h-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</mat-icon>
          Back
        </button>
      </div>

      <!-- Loading -->
      @if (isLoading()) {
        <div class="flex justify-center items-center mt-32">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <!-- Error -->
      @if (!isLoading() && !user()) {
        <div class="max-w-md mx-auto px-6 mt-24 text-center">
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="!text-[32px] !w-8 !h-8">person_off</mat-icon>
          </div>
          <h2 class="text-xl font-bold text-slate-800 mb-1">Profile Not Found</h2>
          <p class="text-slate-500 text-sm">This user profile doesn't exist or may have been deleted.</p>
        </div>
      }

      <!-- Profile Card -->
      @if (!isLoading() && user(); as u) {
        <div class="max-w-2xl mx-auto px-4 mt-6">
          
          <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 relative">
            
            <!-- Read-only badge in top right corner of the card -->
            <div class="absolute top-6 right-6 flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded-full text-slate-400 text-[10px] font-extrabold tracking-wider uppercase">
              <mat-icon class="!text-[11px] !w-3 !h-3">visibility</mat-icon>
              Read-only
            </div>

            <!-- Header: Avatar on the left, details on the right -->
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <!-- Avatar and status badge -->
              <div class="flex flex-col items-center gap-2">
                <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-sm"
                     [style.background]="getAvatarColor(u.userId || u.id)">
                  {{ getInitials(u.fullName) }}
                </div>
                
                <!-- Status Badge below avatar -->
                <div class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border"
                     [ngClass]="u.isActive || u.active ? 'text-green-600 border-green-100 bg-green-50/50' : 'text-slate-400 border-slate-100 bg-slate-50/50'">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="u.isActive || u.active ? 'bg-green-500' : 'bg-slate-300'"></span>
                  {{ u.isActive || u.active ? 'ACTIVE' : 'INACTIVE' }}
                </div>
              </div>

              <!-- Name, Role badge, Member ID next to the avatar -->
              <div class="text-center sm:text-left pt-1">
                <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight mb-1.5">{{ u.fullName }}</h1>
                @if (u.role) {
                  <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide"
                          [ngClass]="getRoleBadgeClass(u.role)">
                      <mat-icon class="!text-[11px] !w-2.5 !h-2.5">{{ getRoleIcon(u.role) }}</mat-icon>
                      {{ formatRole(u.role) }}
                    </span>
                    <span class="text-xs text-slate-400 font-medium">· ID: {{ u.userId || u.id }}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 italic mt-1.5 leading-relaxed">{{ getRoleDescription(u.role) }}</div>
                }
              </div>
            </div>

            <!-- Bio Section (Conditional) -->
            @if (u.bio) {
              <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 mb-6 text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">About</div>
                {{ u.bio }}
              </div>
            }

            <!-- Details list below in a clean simple list -->
            <div class="border-t border-slate-100 pt-6 space-y-4">
              <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Profile Details</h3>

              <!-- Email -->
              <div class="flex items-center gap-3 py-1">
                <mat-icon class="text-slate-400 !text-[18px] !w-[18px] !h-[18px]">email</mat-icon>
                <div class="text-xs text-slate-500 min-w-[70px] uppercase font-bold tracking-wider">Email</div>
                <div class="text-sm font-semibold text-slate-700">{{ u.email }}</div>
              </div>

              <!-- Phone (Conditional) -->
              @if (u.phone) {
                <div class="flex items-center gap-3 py-1">
                  <mat-icon class="text-slate-400 !text-[18px] !w-[18px] !h-[18px]">phone</mat-icon>
                  <div class="text-xs text-slate-500 min-w-[70px] uppercase font-bold tracking-wider">Phone</div>
                  <div class="text-sm font-semibold text-slate-700">{{ u.phone }}</div>
                </div>
              }

              <!-- Location (Conditional) -->
              @if (u.location) {
                <div class="flex items-center gap-3 py-1">
                  <mat-icon class="text-slate-400 !text-[18px] !w-[18px] !h-[18px]">location_on</mat-icon>
                  <div class="text-xs text-slate-500 min-w-[70px] uppercase font-bold tracking-wider">Location</div>
                  <div class="text-sm font-semibold text-slate-700">{{ u.location }}</div>
                </div>
              }

              <!-- Username (Conditional) -->
              @if (u.username && u.username !== u.fullName) {
                <div class="flex items-center gap-3 py-1">
                  <mat-icon class="text-slate-400 !text-[18px] !w-[18px] !h-[18px]">alternate_email</mat-icon>
                  <div class="text-xs text-slate-500 min-w-[70px] uppercase font-bold tracking-wider">Username</div>
                  <div class="text-sm font-semibold text-slate-700">{{ u.username }}</div>
                </div>
              }

              <!-- Website (Conditional) -->
              @if (u.website) {
                <div class="flex items-center gap-3 py-1">
                  <mat-icon class="text-slate-400 !text-[18px] !w-[18px] !h-[18px]">language</mat-icon>
                  <div class="text-xs text-slate-500 min-w-[70px] uppercase font-bold tracking-wider">Website</div>
                  <a [href]="u.website" target="_blank" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                    {{ u.website }}
                  </a>
                </div>
              }

              <!-- Github (Conditional) -->
              @if (u.githubUrl) {
                <div class="flex items-center gap-3 py-1">
                  <mat-icon class="text-slate-400 !text-[18px] !w-[18px] !h-[18px]">code</mat-icon>
                  <div class="text-xs text-slate-500 min-w-[70px] uppercase font-bold tracking-wider">GitHub</div>
                  <a [href]="u.githubUrl" target="_blank" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                    {{ u.githubUrl }}
                  </a>
                </div>
              }
            </div>

            <!-- Own profile notice helper -->
            @if (isOwnProfile()) {
              <div class="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                This is your read-only profile page. To modify any of your settings, contact info, or social links, please visit <a routerLink="/profile" class="text-indigo-600 hover:text-indigo-800 font-bold hover:underline">your account settings</a>.
              </div>
            }

          </div>
        </div>
      }
    </div>
  `
})
export class UserProfileViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  user = signal<User | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.isLoading.set(false);
      return;
    }
    this.authService.getUserById(id).subscribe({
      next: (u) => {
        this.user.set(u);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  isOwnProfile(): boolean {
    const me = this.authService.currentUser();
    const u = this.user();
    if (!me || !u) return false;
    return (me.userId || me.id) === (u.userId || u.id);
  }

  goBack() {
    window.history.back();
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

  getBannerClass(userId: number): string {
    const gradients = [
      'from-indigo-500 to-purple-600',
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-violet-500 to-indigo-600',
    ];
    return gradients[(userId || 0) % gradients.length];
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'PLATFORM_ADMIN': return 'bg-red-50 text-red-700 border border-red-200';
      case 'BOARD_ADMIN':
      case 'ADMIN': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'MEMBER': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
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

  getRoleDescription(role: string): string {
    switch (role) {
      case 'PLATFORM_ADMIN': return 'Has full access to all workspaces and system settings.';
      case 'BOARD_ADMIN':
      case 'ADMIN': return 'Can manage boards, members, and workspace settings.';
      case 'MEMBER': return 'Can create and edit cards on boards they belong to.';
      default: return 'Has view-only access to shared boards.';
    }
  }
}
