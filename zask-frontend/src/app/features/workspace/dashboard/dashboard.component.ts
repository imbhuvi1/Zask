import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, catchError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { BoardService } from '../../../core/services/board.service';
import { CardService } from '../../../core/services/card.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Workspace, WorkspaceMember, WorkspaceVisibility } from '../../../core/models/workspace.model';
import { Board } from '../../../core/models/board.model';
import { Card } from '../../../core/models/card.model';
import { Notification } from '../../../core/models/notification.model';
import { WorkspaceDialogComponent } from '../workspace-dialog/workspace-dialog.component';
import { BoardDialogComponent } from '../board-dialog/board-dialog.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';
import { ClosedBoardsDialogComponent } from '../closed-boards-dialog/closed-boards-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatButtonModule, MatIconModule,
    MatToolbarModule, MatCardModule, MatDialogModule, MatProgressSpinnerModule,
    MatMenuModule, MatDividerModule
  ],
  template: `
    <div class="flex h-full bg-[#f9fafc] font-sans">

      <!-- ═══════════════════════════════════════════
           LEFT SIDEBAR (COLLAPSED)
      ════════════════════════════════════════════ -->
      <div *ngIf="!isSidebarOpen()" class="w-4 bg-white border-r border-gray-200 shrink-0 hidden md:flex flex-col relative group cursor-pointer" (click)="isSidebarOpen.set(true)">
        <div class="absolute right-[-12px] top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm transition-opacity z-10 hover:bg-gray-50">
          <mat-icon class="!text-[16px] !w-[16px] !h-[16px] text-gray-500">chevron_right</mat-icon>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           LEFT SIDEBAR (EXPANDED)
      ════════════════════════════════════════════ -->
      <div *ngIf="isSidebarOpen()" class="w-[260px] bg-white border-r border-gray-200 shrink-0 hidden md:flex flex-col pt-4 overflow-y-auto relative group">
        
        <!-- Collapse button -->
        <div class="absolute right-[-12px] top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm transition-opacity z-10 cursor-pointer hover:bg-gray-50" (click)="isSidebarOpen.set(false)">
          <mat-icon class="!text-[16px] !w-[16px] !h-[16px] text-gray-500">chevron_left</mat-icon>
        </div>

        <!-- Global Nav Links -->
        <div class="px-3 mb-2">
          <ul class="space-y-0.5">
            <li *ngIf="authService.currentUser()?.role === 'PLATFORM_ADMIN'">
              <button class="w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-blue-700 bg-blue-50/50 hover:bg-blue-100/50 border border-blue-100 mb-1"
                      routerLink="/admin">
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-blue-600">shield</mat-icon> Admin Panel
              </button>
            </li>
            <li>
              <button class="w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                      [ngClass]="activeTab() === 'boards' && !selectedWorkspace() ? 'bg-blue-50 text-blue-700' : 'text-[#172b4d] hover:bg-gray-100'"
                      (click)="selectTab('boards'); clearWorkspace()">
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">dashboard</mat-icon> Boards
              </button>
            </li>
            <li>
              <button class="w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                      [ngClass]="activeTab() === 'home' ? 'bg-blue-50 text-blue-700' : 'text-[#172b4d] hover:bg-gray-100'"
                      (click)="selectTab('home'); clearWorkspace()">
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px]"
                          [class.text-blue-600]="activeTab() === 'home'">show_chart</mat-icon> Home
              </button>
            </li>
          </ul>
        </div>

        <mat-divider class="!my-2 mx-4"></mat-divider>

        <!-- Workspaces Accordion -->
        <div class="px-2 mb-2 flex-1">
          <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pl-2">Workspaces</div>

          <div *ngFor="let ws of workspaces()" class="mb-0.5">
            <!-- Workspace Header -->
            <button class="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-left"
                    (click)="toggleWorkspace(ws.workspaceId)">
              <div class="flex items-center gap-2 overflow-hidden">
                <div class="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {{ ws.name.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-bold text-[#172b4d] truncate">{{ ws.name }}</span>
              </div>
              <mat-icon class="!text-[16px] !w-[16px] !h-[16px] text-gray-500">
                {{ expandedWorkspaceId() === ws.workspaceId ? 'expand_less' : 'expand_more' }}
              </mat-icon>
            </button>

            <!-- Expanded Sub-links -->
            <div *ngIf="expandedWorkspaceId() === ws.workspaceId" class="pl-8 pr-2 space-y-0.5 mt-0.5 mb-2">
              <button class="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-colors"
                      [ngClass]="activeTab() === 'boards' && selectedWorkspace()?.workspaceId === ws.workspaceId ? 'bg-blue-50 text-blue-700' : 'text-[#172b4d] hover:bg-gray-100'"
                      (click)="selectWorkspace(ws); selectTab('boards')">
                <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">dashboard</mat-icon> Boards
              </button>
              <div class="flex items-center w-full">
                <button class="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-colors text-[#172b4d] hover:bg-gray-100"
                        [routerLink]="['/w', ws.workspaceId, 'members']">
                  <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">people</mat-icon> Members
                </button>
                <button class="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-gray-200 text-gray-500 shrink-0"
                        [routerLink]="['/w', ws.workspaceId, 'members']">
                  <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">add</mat-icon>
                </button>
              </div>
              <button [routerLink]="['/w', ws.workspaceId, 'settings']" 
                      class="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-[#172b4d] hover:bg-gray-100 rounded-md transition-colors text-left">
                <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">settings</mat-icon> Settings
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- ═══════════════════════════════════════════
           CENTER CONTENT
      ════════════════════════════════════════════ -->
      <div class="flex-1 overflow-y-auto">
        <div class="max-w-[800px] mx-auto p-8 lg:p-12">

          <!-- Loading -->
          <div class="flex justify-center items-center h-[200px]" *ngIf="isLoading()">
            <mat-spinner diameter="40" color="accent"></mat-spinner>
          </div>

          <ng-container *ngIf="!isLoading()">

            <!-- ── HOME TAB ── -->
            <div *ngIf="activeTab() === 'home'">
              <!-- Highlights Header -->
              <div class="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md">
                <h1 class="text-2xl font-bold mb-1">👋 Welcome back!</h1>
                <p class="text-blue-100 text-sm">Stay up to date with activity from your boards and workspaces.</p>
              </div>

              <!-- Highlights Section -->
              <h2 class="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                <mat-icon class="text-orange-500 !text-[20px] !w-5 !h-5">auto_awesome</mat-icon>
                Highlights
              </h2>

              <!-- Activity Feed from notifications -->
              <div class="flex flex-col gap-4" *ngIf="myActivity().length > 0">
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                     *ngFor="let activity of myActivity().slice(0, 5)">
                  <!-- Colored Banner -->
                  <div class="h-2" [ngClass]="activity.recipientId === -1 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-blue-600'"></div>
                  <div class="p-4">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {{ userInitial() }}
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-2" *ngIf="activity.recipientId === -1">
                           <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-widest mb-1 inline-block">Platform Broadcast</span>
                        </div>
                        <div class="text-[#0f172a] text-sm font-medium">{{ activity.message }}</div>
                        <div class="text-xs text-gray-400 mt-0.5">{{ activity.createdAt | date:'medium' }}</div>
                      </div>
                      <button *ngIf="activity.relatedType === 'BOARD' || activity.relatedType === 'CARD'"
                              class="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors shrink-0"
                              (click)="goToRelated(activity)">
                        View {{ activity.relatedType.toLowerCase() }}
                      </button>
                    </div>
                    <!-- Reply bar -->
                    <div class="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                      <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 shrink-0">
                        {{ userInitial() }}
                      </div>
                      <input type="text" placeholder="Reply…"
                             class="flex-1 text-sm border border-gray-200 rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty home state -->
              <div class="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200"
                   *ngIf="myActivity().length === 0">
                <mat-icon class="!text-[40px] !w-10 !h-10 mb-2 opacity-40">history</mat-icon>
                <div class="font-medium">No highlights yet.</div>
                <div class="text-xs mt-1">Start working in your boards and activity will show up here.</div>
              </div>
            </div>

            <!-- ── BOARDS TAB ── -->
            <div *ngIf="activeTab() === 'boards'">
              
              <!-- 1. GLOBAL BOARDS VIEW (No workspace selected) -->
              <div *ngIf="!selectedWorkspace()">
                

                <!-- Recently Viewed -->

                <div class="mb-10" *ngIf="recentBoards().length > 0">
                  <h2 class="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                    <mat-icon class="text-gray-500 !text-[20px] !w-5 !h-5">history</mat-icon>
                    Recently viewed
                  </h2>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div class="h-[100px] cursor-pointer rounded-xl text-white transition-all duration-200 overflow-hidden hover:opacity-90 relative shadow-sm group" 
                         [style.background]="board.background || '#0079bf'"
                         *ngFor="let board of recentBoards()" (click)="goToBoard(board.boardId)">
                      <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      <div class="relative w-full h-full p-3 flex flex-col justify-start">
                        <h3 class="text-white m-0 font-bold text-base drop-shadow-md leading-tight">{{ board.name }}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Your Workspaces Groups -->
                <h2 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Your Workspaces</h2>
                <div class="mb-12" *ngFor="let ws of workspaces()">
                  <!-- Workspace Header Group -->
                  <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {{ ws.name.charAt(0).toUpperCase() }}
                      </div>
                      <h3 class="text-base font-bold text-[#172b4d] m-0">{{ ws.name }}</h3>
                    </div>
                    <div class="flex items-center gap-2">
                      <button class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#172b4d] bg-gray-100 hover:bg-gray-200 rounded transition-colors" (click)="selectWorkspace(ws); selectTab('boards')">
                        <mat-icon class="!text-[16px] !w-4 !h-4">dashboard</mat-icon> Boards
                      </button>
                      <button class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#172b4d] bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                              [routerLink]="['/workspace', ws.workspaceId, 'members']">
                        <mat-icon class="!text-[16px] !w-4 !h-4">people</mat-icon> Members
                      </button>
                      <button class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#172b4d] bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                        <mat-icon class="!text-[16px] !w-4 !h-4">settings</mat-icon> Settings
                      </button>
                    </div>
                  </div>

                  <!-- Boards in this Workspace -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div class="h-[100px] cursor-pointer rounded-xl text-white transition-all duration-200 overflow-hidden hover:opacity-90 relative shadow-sm group" 
                         [style.background]="board.background || '#0079bf'"
                         *ngFor="let board of boardsByWorkspace().get(ws.workspaceId)" (click)="goToBoard(board.boardId)">
                      <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      <div class="relative w-full h-full p-3 flex flex-col justify-start">
                        <h3 class="text-white m-0 font-bold text-base drop-shadow-md leading-tight">{{ board.name }}</h3>
                      </div>
                    </div>
                    <!-- Create New Board -->
                    <div *ngIf="userRoleInWorkspace() !== 'OBSERVER'"
                         class="h-[100px] bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl cursor-pointer flex flex-col items-center justify-center transition-colors shadow-sm group" 
                         (click)="selectWorkspace(ws); openCreateBoardDialog()">
                      <span class="text-sm font-medium text-gray-600">Create new board</span>
                    </div>
                  </div>
                </div>

                <!-- Closed Boards Section -->
                <div class="mt-16 pb-12">
                   <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors" (click)="openClosedBoardsDialog()">
                     View all closed boards
                   </button>
                </div>
              </div>

              <!-- 2. SPECIFIC WORKSPACE VIEW (Legacy/Deep view) -->
              <div *ngIf="selectedWorkspace()">
                <div class="mb-10">

                  <!-- Workspace Header (Trello-style) -->
                  <div class="mb-6 pb-6 border-b border-gray-200">

                    <!-- VIEW MODE -->
                    <div *ngIf="!editingWorkspace()" class="flex items-start gap-4">
                      <div class="w-16 h-16 rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center text-3xl font-bold shrink-0">
                        {{ selectedWorkspace()!.name.charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <h1 class="text-2xl font-bold text-[#0f172a] m-0">{{ selectedWorkspace()!.name }}</h1>
                          <button class="text-gray-400 hover:text-gray-600 transition-colors" title="Edit workspace"
                                  (click)="startEditWorkspace()">
                            <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">edit</mat-icon>
                          </button>
                        </div>
                        <div class="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">
                            {{ selectedWorkspace()!.visibility === 'PUBLIC' ? 'public' : 'lock' }}
                          </mat-icon>
                          <span class="capitalize">{{ (selectedWorkspace()!.visibility || 'PRIVATE').toLowerCase() }}</span>
                        </div>
                        <p class="mt-1 text-sm text-gray-500 m-0 italic" *ngIf="!selectedWorkspace()!.description">
                          No description yet. Click edit to add one.
                        </p>
                        <p class="mt-1 text-sm text-gray-600 m-0" *ngIf="selectedWorkspace()!.description">
                          {{ selectedWorkspace()!.description }}
                        </p>
                      </div>
                    </div>

                    <!-- EDIT MODE -->
                    <div *ngIf="editingWorkspace()" class="max-w-lg">
                      <p class="text-xs text-gray-500 mb-4">Required fields are marked with an asterisk <span class="text-red-500">*</span></p>

                      <div class="flex flex-col gap-4">
                        <!-- Name -->
                        <div class="flex flex-col gap-1">
                          <label class="text-sm font-semibold text-[#172b4d]">Name <span class="text-red-500">*</span></label>
                          <input type="text" [ngModel]="wsEditName()" (ngModelChange)="wsEditName.set($event)"
                                 class="border border-blue-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                                 placeholder="Workspace name" />
                        </div>

                        <!-- Visibility -->
                        <div class="flex flex-col gap-1">
                          <label class="text-sm font-semibold text-[#172b4d]">Visibility</label>
                          <select [ngModel]="wsEditVisibility()" (ngModelChange)="wsEditVisibility.set($event)"
                                  class="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full">
                            <option value="PRIVATE">Private</option>
                            <option value="PUBLIC">Public</option>
                          </select>
                        </div>

                        <!-- Description -->
                        <div class="flex flex-col gap-1">
                          <label class="text-sm font-semibold text-[#172b4d]">Description <span class="text-gray-400 font-normal">(optional)</span></label>
                          <textarea [ngModel]="wsEditDescription()" (ngModelChange)="wsEditDescription.set($event)"
                                    rows="3"
                                    class="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full resize-none"
                                    placeholder="What is this workspace for?"></textarea>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-2">
                          <button (click)="saveWorkspaceEdit()"
                                  [disabled]="!wsEditName().trim()"
                                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                            Save
                          </button>
                          <button (click)="cancelWorkspaceEdit()"
                                  class="bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  <!-- Your boards label -->
                  <div class="flex items-center gap-2 mb-4">
                    <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-gray-500">person</mat-icon>
                    <h2 class="text-base font-bold text-[#0f172a] m-0">Your boards</h2>
                  </div>

                  <!-- Filters Toolbar -->
                  <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div class="flex items-center gap-4">
                      <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Sort by</label>
                        <select [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)"
                                class="border border-gray-300 rounded-md py-1.5 px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700 w-[180px]">
                          <option value="All">All</option>
                          <option value="Most recently active">Most recently active</option>
                          <option value="Alphabetically A-Z">Alphabetically A-Z</option>
                          <option value="Alphabetically Z-A">Alphabetically Z-A</option>
                        </select>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Filter by</label>
                        <select [ngModel]="filterBy()" (ngModelChange)="filterBy.set($event)"
                                class="border border-gray-300 rounded-md py-1.5 px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700 w-[180px]">
                          <option value="All">All visibility</option>
                          <option value="Public">Public</option>
                          <option value="Private">Private</option>
                        </select>
                      </div>
                    </div>
                    <div class="flex flex-col gap-1 w-full sm:w-auto">
                      <label class="text-xs font-bold text-gray-500 uppercase">Search</label>
                      <div class="relative">
                        <mat-icon class="absolute left-2.5 top-1.5 !text-[18px] !w-[18px] !h-[18px] text-gray-400">search</mat-icon>
                        <input type="text" [ngModel]="searchQuery()" (input)="onSearchInput($event)"
                               placeholder="Search boards"
                               class="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm w-full sm:w-[250px] focus:outline-none focus:ring-1 focus:ring-orange-500" />
                      </div>
                    </div>
                  </div>

                  <!-- Boards Grid (Local) -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div *ngIf="userRoleInWorkspace() !== 'OBSERVER'"
                         class="h-[100px] bg-orange-100 hover:bg-orange-200 border-2 border-dashed border-orange-300 hover:border-orange-400 rounded-xl cursor-pointer flex flex-col items-center justify-center transition-colors shadow-sm"
                         (click)="openCreateBoardDialog()">
                      <mat-icon class="text-orange-500 mb-1">add_circle</mat-icon>
                      <span class="text-sm font-semibold text-orange-700">Create new board</span>
                    </div>

                    <div class="h-[100px] cursor-pointer rounded-xl text-white transition-all duration-200 overflow-hidden hover:opacity-90 relative shadow-sm group"
                         [style.background]="board.background || '#0079bf'"
                         *ngFor="let board of filteredBoards()"
                         (click)="goToBoard(board.boardId)">
                      <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      <div class="relative w-full h-full p-3 flex flex-col justify-start">
                        <h3 class="text-white m-0 font-bold text-base drop-shadow-md leading-tight">{{ board.name }}</h3>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="filteredBoards().length === 0 && boards().length > 0" class="p-8 text-center text-gray-500">
                    No boards found matching your filters.
                  </div>

                  <div class="mt-8 border-t border-gray-100 pt-6">
                    <button mat-stroked-button class="!bg-white !text-gray-600 !border-gray-300 !rounded-lg !px-4 !py-1 hover:!bg-gray-50 transition-colors" (click)="openClosedBoardsDialog()">
                      View closed boards
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── MEMBERS TAB ── -->
            <div *ngIf="activeTab() === 'members' && selectedWorkspace()">
              <h1 class="text-3xl font-bold text-[#0f172a] mb-2 flex items-center gap-3">
                Collaborators
                <span class="text-sm font-medium bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full">
                  {{ members().length }} / 10
                </span>
              </h1>

              <div class="flex border-b border-gray-200 mb-6 mt-6">
                <button class="px-4 py-3 text-sm font-bold text-orange-600 border-b-2 border-orange-600 whitespace-nowrap">
                  Members ({{ members().length }})
                </button>
              </div>

              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-200 pb-6">
                <p class="text-sm text-gray-700 m-0">Workspace members can view and join all Workspace visible boards and create new boards.</p>
                <button (click)="inviteWorkspaceMember()"
                        class="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors flex items-center gap-2">
                  <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">person_add</mat-icon>
                  Invite Workspace members
                </button>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 rounded"
                     *ngFor="let member of members()">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center font-bold text-xs">
                      U{{ member.userId }}
                    </div>
                    <div>
                      <div class="font-bold text-sm text-[#0f172a]">User ID: {{ member.userId }}</div>
                      <div class="text-xs text-gray-500">Joined {{ member.joinedAt | date:'mediumDate' }}</div>
                    </div>
                  </div>
                  <span class="text-sm text-gray-700 capitalize">{{ member.role.toLowerCase() }}</span>
                </div>
              </div>
            </div>

            <!-- ── CARDS TAB ── -->
            <div *ngIf="activeTab() === 'cards'">
              <h1 class="text-3xl font-bold text-[#0f172a] mb-6">Your Cards</h1>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" *ngIf="myCards().length > 0">
                <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                     *ngFor="let card of myCards()">
                  <div class="text-xs font-bold text-orange-500 mb-1">Board ID: {{ card.boardId }}</div>
                  <div class="text-[#0f172a] font-medium">{{ card.title }}</div>
                  <div class="text-sm text-gray-500 mt-2">{{ card.description || 'No description' }}</div>
                </div>
              </div>
              <div class="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200"
                   *ngIf="myCards().length === 0">
                <mat-icon class="!text-[40px] !w-10 !h-10 mb-2 opacity-50">payment</mat-icon>
                <div>No cards assigned to you.</div>
              </div>
            </div>

            <!-- ── ACTIVITY TAB ── -->
            <div *ngIf="activeTab() === 'activity'">
              <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-bold text-[#0f172a] m-0">Your Activity</h1>
                <button *ngIf="myActivity().length > 0" 
                        mat-button 
                        color="warn" 
                        class="!text-red-600 hover:!bg-red-50 !rounded-lg !px-4"
                        (click)="clearAllActivity()">
                  <mat-icon class="mr-1">delete_sweep</mat-icon>
                  Clear All
                </button>
              </div>
              <div class="flex flex-col gap-4" *ngIf="myActivity().length > 0">
                <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 relative group"
                     *ngFor="let activity of myActivity()">
                  <div class="mt-1 w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">notifications</mat-icon>
                  </div>
                  <div class="flex-1">
                    <div class="text-[#0f172a] text-sm font-medium">{{ activity.message }}</div>
                    <div class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <mat-icon class="!text-[12px] !w-[12px] !h-[12px] text-gray-400">schedule</mat-icon>
                      {{ activity.createdAt | date:'medium' }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button *ngIf="activity.relatedType === 'BOARD' || activity.relatedType === 'CARD'"
                            class="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                            (click)="goToRelated(activity)">
                      View {{ activity.relatedType.toLowerCase() }}
                    </button>
                    <button mat-icon-button 
                            class="!text-gray-400 hover:!text-red-500 !w-8 !h-8 !leading-8 shrink-0 hover:bg-gray-100 rounded-full transition-all"
                            (click)="clearSingleActivity(activity.notificationId)"
                            title="Clear this activity">
                      <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">close</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
              <div class="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200"
                   *ngIf="myActivity().length === 0">
                <mat-icon class="!text-[40px] !w-10 !h-10 mb-2 opacity-50">history</mat-icon>
                <div>No recent activity to show.</div>
              </div>
            </div>

          </ng-container>

          <!-- Empty State (No workspaces) -->
          <div class="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-dashed border-gray-300"
               *ngIf="!isLoading() && workspaces().length === 0 && (activeTab() === 'boards' || activeTab() === 'members')">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <mat-icon class="!text-[32px] !w-8 !h-8 text-gray-400">domain</mat-icon>
            </div>
            <h3 class="m-0 mb-2 text-xl font-bold text-[#0f172a]">No Workspaces Yet</h3>
            <p class="text-gray-500 text-sm text-center max-w-sm">Create your first workspace to start collaborating!</p>
          </div>

        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           RIGHT SIDEBAR
      ════════════════════════════════════════════ -->
      <div class="w-[280px] bg-white border-l border-gray-200 shrink-0 hidden xl:flex flex-col pt-6 px-4 overflow-y-auto">

        <!-- Recently Viewed -->
        <div class="mb-6">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recently Viewed</h3>
          <div class="flex flex-col gap-2">
            <div *ngFor="let board of recentBoards()"
                 class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                 (click)="goToBoard(board.boardId)">
              <div class="w-10 h-8 rounded shrink-0" [style.background-color]="board.background || '#0079bf'"></div>
              <div class="overflow-hidden">
                <div class="text-sm font-medium text-[#172b4d] truncate group-hover:text-blue-600">{{ board.name }}</div>
                <div class="text-xs text-gray-400 truncate">{{ selectedWorkspace()?.name || 'Board' }}</div>
              </div>
            </div>
            <div *ngIf="recentBoards().length === 0" class="text-xs text-gray-400 px-2">No boards visited yet.</div>
          </div>
        </div>

        <mat-divider class="!my-2"></mat-divider>

        <!-- Quick Links -->
        <div class="mt-4">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Links</h3>
          <button *ngIf="userRoleInWorkspace() !== 'OBSERVER'"
                  (click)="openCreateBoardDialog()"
                  class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">add</mat-icon>
            Create new board
          </button>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private boardService = inject(BoardService);
  private cardService = inject(CardService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── State ──────────────────────────────────────────────────────────────────
  isSidebarOpen = signal<boolean>(true);
  workspaces = signal<Workspace[]>([]);
  allBoards = signal<Board[]>([]);
  selectedWorkspace = signal<Workspace | null>(null);

  boards = signal<Board[]>([]);
  members = signal<WorkspaceMember[]>([]);
  myCards = signal<Card[]>([]);
  myActivity = signal<Notification[]>([]);
  
  userRoleInWorkspace = signal<string | null>(null);

  isLoading = signal<boolean>(true);

  /** Includes 'home' in addition to the original tabs */
  activeTab = signal<'home' | 'boards' | 'members' | 'cards' | 'activity'>('boards');

  /** Which workspace row is expanded in the sidebar accordion */
  expandedWorkspaceId = signal<number | null>(null);

  searchQuery = signal<string>('');
  sortBy = signal<string>('Most recently active');
  filterBy = signal<string>('All');

  // Workspace inline edit state
  editingWorkspace = signal<boolean>(false);
  wsEditName = signal<string>('');
  wsEditDescription = signal<string>('');
  wsEditVisibility = signal<'PUBLIC' | 'PRIVATE'>('PRIVATE');

  // ── Computed ───────────────────────────────────────────────────────────────
  filteredBoards = computed(() => {
    let result = [...this.boards()];

    const filter = this.filterBy();
    if (filter !== 'All') {
      result = result.filter(b => b.visibility === filter.toUpperCase());
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(b => b.name.toLowerCase().includes(query));
    }

    const sort = this.sortBy();
    if (sort === 'Alphabetically A-Z') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'Alphabetically Z-A') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  });

  /** Starred boards from allBoards */
  starredBoards = computed(() => this.allBoards().filter(b => b.isStarred && !b.isClosed));

  /** Recently viewed boards from allBoards */
  recentBoards = computed(() => {
    const ids = this.getRecentBoardIds();
    return ids
      .map(id => this.allBoards().find(b => b.boardId === id))
      .filter((b): b is Board => !!b && !b.isClosed)
      .slice(0, 5);
  });

  /** Boards grouped by workspace for the global view */
  boardsByWorkspace = computed(() => {
    const map = new Map<number, Board[]>();
    this.allBoards().filter(b => !b.isClosed).forEach(b => {
      if (!map.has(b.workspaceId)) map.set(b.workspaceId, []);
      map.get(b.workspaceId)!.push(b);
    });
    return map;
  });

  /** All closed boards */
  closedBoards = computed(() => this.allBoards().filter(b => b.isClosed));

  /** Safe user initial regardless of which field exists on User model */
  userInitial = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return 'U';
    const src = (u as any).name || (u as any).username || (u as any).email || 'U';
    return src.charAt(0).toUpperCase();
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'activity' || tab === 'cards' || tab === 'boards' || tab === 'members' || tab === 'home') {
        this.selectTab(tab as 'home' | 'boards' | 'members' | 'cards' | 'activity');
      }
    });
    this.loadWorkspaces();
  }

  // ── Sidebar Helpers ────────────────────────────────────────────────────────

  /**
   * Toggles the accordion for a workspace row.
   * Collapses if already open, expands otherwise.
   */
  toggleWorkspace(workspaceId: number): void {
    this.expandedWorkspaceId.update(current =>
      current === workspaceId ? null : workspaceId
    );
  }

  /**
   * Clears the currently selected workspace (used by global nav links).
   */
  clearWorkspace(): void {
    this.selectedWorkspace.set(null);
    this.expandedWorkspaceId.set(null);
    this.loadWorkspaces();
  }

  getRecentBoardIds(): number[] {
    const stored = localStorage.getItem('recentBoards');
    return stored ? JSON.parse(stored) : [];
  }

  saveRecentBoardId(id: number) {
    let ids = this.getRecentBoardIds();
    ids = [id, ...ids.filter(i => i !== id)].slice(0, 5);
    localStorage.setItem('recentBoards', JSON.stringify(ids));
  }

  // ── Tab / Search ───────────────────────────────────────────────────────────
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  selectTab(tab: 'home' | 'boards' | 'members' | 'cards' | 'activity') {
    this.activeTab.set(tab);

    if (tab === 'home' && this.myActivity().length === 0) {
      this.loadMyActivity();
    } else if (tab === 'boards' && !this.selectedWorkspace()) {
      this.loadAllBoards();
    } else if (tab === 'cards' && this.myCards().length === 0) {
      this.loadMyCards();
    } else if (tab === 'activity' && this.myActivity().length === 0) {
      this.loadMyActivity();
    }
  }

  // ── Data Loaders ───────────────────────────────────────────────────────────
  loadMyCards() {
    this.isLoading.set(true);
    const userId = this.authService.currentUser()?.id || 1;
    this.cardService.getCardsByAssignee(userId).subscribe({
      next: (cards) => { 
        this.myCards.set(cards.filter(c => !c.isArchived)); 
        this.isLoading.set(false); 
      },
      error: (err) => { console.error('Failed to load cards', err); this.isLoading.set(false); }
    });
  }

  loadMyActivity() {
    this.isLoading.set(true);
    const userId = this.authService.currentUser()?.id || 1;
    this.notificationService.getByRecipient(userId).subscribe({
      next: (notifications) => {
        const sorted = notifications.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.myActivity.set(sorted);
        this.isLoading.set(false);
      },
      error: (err) => { console.error('Failed to load activity', err); this.isLoading.set(false); }
    });
  }

  loadAllBoards() {
    this.isLoading.set(true);
    const userId = this.authService.currentUser()?.id || 1;
    this.boardService.getBoardsByMember(userId).subscribe({
      next: (boards) => {
        this.allBoards.set(boards);
        this.isLoading.set(false);
      },
      error: (err) => { console.error('Failed to load all boards', err); this.isLoading.set(false); }
    });
  }

  loadWorkspaces() {
    this.isLoading.set(true);
    const userId = this.authService.currentUser()?.id || 1;

    forkJoin({
      owned: this.workspaceService.getWorkspacesByOwner(userId),
      member: this.workspaceService.getWorkspacesByMember(userId),
      boards: this.boardService.getBoardsByMember(userId)
    }).subscribe({
      next: (results) => {
        // We update the signals via processWorkspaces which is called below

        // 2. Process what we already have (Owned + Direct Memberships)
        const initialWorkspaces = [...results.owned, ...results.member];
        this.processWorkspaces(initialWorkspaces);

        // 3. Load extra workspaces from boards in the background
        const wsFromBoardsRequests = results.boards.map(b => 
          this.workspaceService.getById(b.workspaceId).pipe(catchError(() => of(null)))
        );
        
        if (wsFromBoardsRequests.length > 0) {
          forkJoin(wsFromBoardsRequests).subscribe(wsFromBoards => {
            const validWsFromBoards = wsFromBoards.filter((ws): ws is Workspace => ws !== null);
            // Combine with existing and deduplicate again
            const combined = [...initialWorkspaces, ...validWsFromBoards];
            this.processWorkspaces(combined);
          });
        }
        this.loadMyActivity();
      },
      error: (err) => { console.error('Failed to load workspaces', err); this.isLoading.set(false); }
    });
  }

  private processWorkspaces(allWorkspaces: Workspace[]) {
    const uniqueWorkspaces = Array.from(
      new Map(allWorkspaces.map(ws => [ws.workspaceId, ws])).values()
    );
    this.workspaces.set(uniqueWorkspaces);

    // Fetch ALL boards for ALL these workspaces to show in the global "Boards" view
    const wsIds = uniqueWorkspaces.map(w => w.workspaceId);
    if (wsIds.length > 0) {
      forkJoin(wsIds.map(id => this.boardService.getBoardsByWorkspace(id).pipe(catchError(() => of([])))))
        .subscribe(allResults => {
          const allVisibleBoards = allResults.flat();
          // Deduplicate boards (in case a board was already in the list)
          const uniqueBoards = Array.from(new Map(allVisibleBoards.map(b => [b.boardId, b])).values());
          this.allBoards.set(uniqueBoards);
          this.isLoading.set(false);
        });
    } else {
      this.isLoading.set(false);
    }

    // If no workspace is explicitly selected, load the global view
    if (!this.selectedWorkspace()) {
      // No need to call loadAllBoards() separately as we just loaded all boards above
    }
  }

  selectWorkspace(ws: Workspace) {
    this.selectedWorkspace.set(ws);
    this.activeTab.set('boards');
    this.isLoading.set(true);

    this.boardService.getBoardsByWorkspace(ws.workspaceId).subscribe({
      next: (boardsData) => {
        this.boards.set(boardsData);
        this.workspaceService.getMembers(ws.workspaceId).subscribe({
          next: (membersData) => { 
            this.members.set(membersData); 
            const currentUser = this.authService.currentUser();
            const me = membersData.find(m => m.userId === currentUser?.userId);
            const isOwner = ws.ownerId === currentUser?.userId;
            const isPlatformAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'PLATFORM_ADMIN';
            
            if (isOwner || isPlatformAdmin || me?.role === 'ADMIN') {
              this.userRoleInWorkspace.set('ADMIN');
            } else {
              this.userRoleInWorkspace.set(me?.role || 'OBSERVER');
            }
            this.isLoading.set(false); 
          },
          error: (err) => { console.error('Failed to load members', err); this.isLoading.set(false); }
        });
      },
      error: (err) => { console.error('Failed to load boards', err); this.isLoading.set(false); }
    });
  }

  startEditWorkspace() {
    const ws = this.selectedWorkspace();
    if (!ws) return;
    this.wsEditName.set(ws.name);
    this.wsEditDescription.set(ws.description || '');
    this.wsEditVisibility.set(ws.visibility || 'PRIVATE');
    this.editingWorkspace.set(true);
  }

  cancelWorkspaceEdit() {
    this.editingWorkspace.set(false);
  }

  saveWorkspaceEdit() {
    const ws = this.selectedWorkspace();
    if (!ws || !this.wsEditName().trim()) return;

    const payload: Partial<Workspace> = {
      name: this.wsEditName().trim(),
      description: this.wsEditDescription().trim(),
      visibility: this.wsEditVisibility()
    };

    this.workspaceService.updateWorkspace(ws.workspaceId, payload).subscribe({
      next: (updated) => {
        this.selectedWorkspace.set(updated);
        this.workspaces.update(list =>
          list.map(w => w.workspaceId === updated.workspaceId ? updated : w)
        );
        this.editingWorkspace.set(false);
      },
      error: (err) => {
        console.error('Failed to update workspace', err);
        alert('Failed to save changes: ' + (err.error?.error || err.message));
      }
    });
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  goToBoard(boardId: number) {
    this.saveRecentBoardId(boardId);
    this.router.navigate(['/board', boardId]);
  }

  goToRelated(activity: Notification) {
    if (activity.relatedType === 'BOARD') {
      this.goToBoard(activity.relatedId);
    }
  }

  openClosedBoardsDialog() {
    const dialogRef = this.dialog.open(ClosedBoardsDialogComponent, {
      width: '600px',
      data: { boards: this.closedBoards() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the local boards list based on the action in the dialog
        if (result.action === 'reopen' || result.action === 'delete') {
          this.loadWorkspaces(); // Refresh boards and workspaces
        }
      }
    });
  }

  toggleStar(event: Event, board: Board) {
    event.stopPropagation();
    const isStarred = !board.isStarred;
    this.boardService.updateBoard(board.boardId, { isStarred }).subscribe({
      next: (updated) => {
        board.isStarred = updated.isStarred;
        this.allBoards.update(list => list.map(b => b.boardId === board.boardId ? { ...b, isStarred: updated.isStarred } : b));
      },
      error: (err) => console.error('Failed to toggle star', err)
    });
  }

  reopenBoard(board: Board) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reopen Board',
        message: `Are you sure you want to reopen "${board.name}"? It will become visible and active for all members again.`,
        confirmText: 'Reopen',
        isDestructive: false
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardService.reopenBoard(board.boardId).subscribe(() => {
          this.loadAllBoards();
        });
      }
    });
  }

  // ── Dialogs & Actions ──────────────────────────────────────────────────────
  openCreateWorkspaceDialog() {
    const dialogRef = this.dialog.open(WorkspaceDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const payload = { ...result, ownerId: this.authService.currentUser()?.userId || 1 };
        this.workspaceService.createWorkspace(payload).subscribe({
          next: (newWorkspace) => {
            this.workspaces.update(ws => {
              if (ws.some(w => w.workspaceId === newWorkspace.workspaceId)) return ws;
              return [...ws, newWorkspace];
            });
            this.selectWorkspace(newWorkspace);

            const userId = this.authService.currentUser()?.userId || 1;
            this.notificationService.createNotification({
              recipientId: userId,
              message: `Created a new workspace '${newWorkspace.name}'`,
              relatedId: newWorkspace.workspaceId,
              relatedType: 'WORKSPACE'
            }).subscribe();
          },
          error: (err) => console.error('Failed to create workspace', err)
        });
      }
    });
  }

  openCreateBoardDialog() {
    const ws = this.selectedWorkspace();
    const dialogRef = this.dialog.open(BoardDialogComponent, { 
      width: '400px',
      data: {
        workspaceId: ws?.workspaceId,
        workspaces: this.workspaces()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const payload = {
          ...result,
          createdById: this.authService.currentUser()?.userId || 1
        };
        this.boardService.createBoard(payload).subscribe({
          next: (board: Board) => {
            this.boards.update(b => [...b, board]);

            const userId = this.authService.currentUser()?.userId || 1;
            this.notificationService.createNotification({
              recipientId: userId,
              message: `Created a new board '${board.name}'`,
              relatedId: board.boardId,
              relatedType: 'BOARD'
            }).subscribe();
          }
        });
      }
    });
  }

  inviteWorkspaceMember() {
    const ws = this.selectedWorkspace();
    if (!ws) return;
    this.router.navigate(['/workspace', ws.workspaceId, 'members']);
  }

  inviteBoardMember(board: Board) {
    this.router.navigate(['/board', board.boardId, 'members']);
  }

  clearAllActivity() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Clear All Activity',
        message: 'Are you sure you want to clear all your recent activities and notifications?',
        confirmText: 'Clear All',
        isDestructive: true
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const userId = this.authService.currentUser()?.id || 1;
        this.notificationService.clearAllNotifications(userId).subscribe({
          next: () => {
            this.myActivity.set([]);
          },
          error: (err) => console.error('Failed to clear all activity', err)
        });
      }
    });
  }

  clearSingleActivity(activityId: number) {
    this.notificationService.deleteNotification(activityId).subscribe({
      next: () => {
        this.myActivity.update(activities => activities.filter(a => a.notificationId !== activityId));
      },
      error: (err) => console.error('Failed to delete activity item', err)
    });
  }
}