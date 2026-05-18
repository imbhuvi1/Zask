import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { AuthService } from '../../../core/services/auth.service';
import { Workspace } from '../../../core/models/workspace.model';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-workspace-settings-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule],
  template: `
    <div class="flex h-screen bg-white font-sans overflow-hidden">
      
      <!-- Left Sidebar -->
      <aside class="w-[280px] bg-[#f9fafb] border-r border-gray-200 flex flex-col pt-12 shrink-0 overflow-y-auto relative group">
        
        <!-- Collapse button (Mock) -->
        <div class="absolute right-[-12px] top-12 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm transition-opacity z-10 cursor-pointer">
          <mat-icon class="!text-[16px] !w-4 !h-4 text-gray-500">chevron_left</mat-icon>
        </div>

        <!-- Personal Settings Section -->
        <div class="px-6 mb-8">
          <h3 class="text-xs font-bold text-gray-500 mb-4 px-2 uppercase tracking-tight">Personal Settings</h3>
          <ul class="space-y-1">
            <li *ngFor="let item of personalItems">
              <button [routerLink]="[item.route]" 
                      [queryParams]="item.query"
                      class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#172b4d] hover:bg-gray-200/50">
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-gray-600">{{ item.icon }}</mat-icon>
                {{ item.label }}
              </button>
            </li>
          </ul>
        </div>

        <div class="px-6 mb-8">
          <div class="h-px bg-gray-200 mx-2 mb-6"></div>
          
          <h3 class="text-xs font-bold text-gray-500 mb-4 px-2 uppercase tracking-tight">Workspace</h3>
          
          <!-- Workspace Selector Dropdown -->
          <div class="px-2 mb-4 relative">
            <div (click)="showWorkspaceDropdown.set(!showWorkspaceDropdown())"
                 class="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-gray-400 transition-all">
              <div class="w-6 h-6 rounded bg-green-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {{ workspace()?.name?.charAt(0)?.toUpperCase() || 'W' }}
              </div>
              <span class="text-sm font-medium text-[#172b4d] truncate flex-1">{{ workspace()?.name }}</span>
              <mat-icon class="!text-[16px] !w-4 !h-4 text-gray-400">expand_more</mat-icon>
            </div>

            <!-- Dropdown List -->
            <div *ngIf="showWorkspaceDropdown()" 
                 class="absolute top-full left-2 right-2 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div *ngFor="let ws of allWorkspaces()" 
                   (click)="switchWorkspace(ws)"
                   class="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                <div class="w-6 h-6 rounded bg-green-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {{ ws.name.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-gray-700 truncate">{{ ws.name }}</span>
              </div>
            </div>
          </div>

          <ul class="space-y-1">
            <li>
              <button [routerLink]="['/w', workspaceId, 'boards']" 
                      routerLinkActive="bg-[#e9f2ff] text-[#0055cc] !hover:bg-[#e9f2ff]"
                      class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#172b4d] hover:bg-gray-200/50">
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-gray-600">dashboard</mat-icon>
                Boards
              </button>
            </li>
            <li>
              <button [routerLink]="['/workspace', workspaceId, 'members']" 
                      routerLinkActive="bg-[#e9f2ff] text-[#0055cc] !hover:bg-[#e9f2ff]"
                      class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#172b4d] hover:bg-gray-200/50">
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-gray-600">people</mat-icon>
                Members
              </button>
            </li>
            <li>
              <button [routerLink]="['/workspace', workspaceId, 'settings']" 
                      routerLinkActive="bg-[#e9f2ff] text-[#0055cc] !hover:bg-[#e9f2ff]"
                      class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-[#172b4d] hover:bg-gray-200/50">
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-gray-600">settings</mat-icon>
                Settings
              </button>
            </li>
          </ul>
        </div>

      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto relative">
        <router-outlet></router-outlet>
      </main>

    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .active-link { background-color: #e9f2ff; color: #0055cc; }
  `]
})
export class WorkspaceSettingsLayoutComponent implements OnInit {
  workspaceService = inject(WorkspaceService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  workspaceId!: number;
  workspace = signal<Workspace | null>(null);
  allWorkspaces = signal<Workspace[]>([]);
  showWorkspaceDropdown = signal<boolean>(false);

  personalItems = [
    { label: 'Profile and Visibility', icon: 'account_circle', route: '/profile' },
    { label: 'Activity', icon: 'history', route: '/notifications' },
    { label: 'Cards', icon: 'payment', route: '/dashboard', query: { tab: 'cards' } },
    { label: 'Settings', icon: 'settings', route: '/dashboard' },
  ];

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.workspaceId = +params['id'];
        this.loadWorkspace();
      }
    });

    this.loadAllWorkspaces();
  }

  loadWorkspace() {
    this.workspaceService.getById(this.workspaceId).subscribe(ws => this.workspace.set(ws));
  }

  loadAllWorkspaces() {
    const userId = this.authService.currentUser()?.id || 1;
    forkJoin({
      owned: this.workspaceService.getWorkspacesByOwner(userId),
      member: this.workspaceService.getWorkspacesByMember(userId)
    }).subscribe(results => {
      const combined = [...results.owned, ...results.member];
      const unique = Array.from(new Map(combined.map(ws => [ws.workspaceId, ws])).values());
      this.allWorkspaces.set(unique);
    });
  }

  switchWorkspace(ws: Workspace) {
    this.workspaceId = ws.workspaceId;
    this.workspace.set(ws);
    this.showWorkspaceDropdown.set(false);
    
    // Maintain the current child route (boards/members/settings)
    const currentPath = this.router.url.split('/').pop();
    this.router.navigate(['/w', ws.workspaceId, currentPath]);
  }
}
