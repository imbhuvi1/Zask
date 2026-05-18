import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatIconModule, MatButtonModule, MatDividerModule
  ],
  template: `
    <div class="flex flex-col h-screen overflow-hidden font-sans text-[#172b4d]">
      <!-- Admin Top Navbar -->
      <header class="h-[56px] bg-[#091e42] text-white flex items-center justify-between px-6 shrink-0 shadow-md z-20">
        <div class="flex items-center gap-2 cursor-pointer" routerLink="/admin">
          <mat-icon class="text-blue-400">shield</mat-icon>
          <span class="font-bold text-xl tracking-tight">Zask Admin</span>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm">
            <mat-icon class="!text-[16px] !w-4 !h-4 text-green-400">lens</mat-icon>
            <span class="font-medium">System Online</span>
          </div>
          
          <button (click)="exitAdmin()" class="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
            <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">exit_to_app</mat-icon>
            Exit Admin
          </button>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden">
        <!-- Admin Sidebar -->
        <aside class="w-[260px] bg-white border-r border-gray-200 flex flex-col pt-6 shrink-0 shadow-sm z-10">
          <div class="px-4 mb-6">
            <h3 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Management</h3>
            <nav class="space-y-1">
              <a *ngFor="let item of navItems" 
                 [routerLink]="item.route"
                 routerLinkActive="bg-blue-50 text-blue-700 active-link"
                 class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all hover:bg-gray-50 group">
                <mat-icon class="!text-[20px] !w-5 !h-5 text-gray-500 group-hover:text-blue-600 transition-colors"
                          [class.text-blue-600]="isActive(item.route)">{{ item.icon }}</mat-icon>
                {{ item.label }}
              </a>
            </nav>
          </div>

          <mat-divider class="mx-4 !my-2"></mat-divider>

          <div class="px-4 mt-2">
            <h3 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Security</h3>
            <nav class="space-y-1">
              <a routerLink="/admin/settings" 
                 routerLinkActive="bg-blue-50 text-blue-700 active-link"
                 class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all hover:bg-gray-50 group">
                <mat-icon class="!text-[20px] !w-5 !h-5 text-gray-500 group-hover:text-blue-600 transition-colors">settings</mat-icon>
                Platform Settings
              </a>
            </nav>
          </div>

          <div class="mt-auto p-4">
             <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
               <div class="text-xs font-bold text-blue-800 mb-1">ADMIN SESSION</div>
               <div class="text-[10px] text-blue-600 mb-3 leading-relaxed">You are viewing the platform as a Super Administrator.</div>
               <div class="w-full h-1 bg-blue-200 rounded-full overflow-hidden">
                 <div class="w-full h-full bg-blue-600"></div>
               </div>
             </div>
          </div>
        </aside>

        <!-- Main Admin Content -->
        <main class="flex-1 overflow-y-auto bg-[#f4f5f7] p-8">
          <div class="max-w-6xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .active-link {
      box-shadow: inset 4px 0 0 -1px #0052cc;
    }
  `]
})
export class AdminLayoutComponent {
  private router = inject(Router);
  authService = inject(AuthService);

  navItems = [
    { label: 'Analytics', icon: 'analytics', route: '/admin/dashboard' },
    { label: 'User Directory', icon: 'people', route: '/admin/users' },
    { label: 'Workspace Audit', icon: 'corporate_fare', route: '/admin/workspaces' }
  ];

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  exitAdmin() {
    this.router.navigate(['/dashboard']);
  }
}
