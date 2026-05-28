import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { WorkspaceService } from '../../services/workspace.service';
import { BoardService } from '../../services/board.service';
import { CardService } from '../../services/card.service';
import { Notification } from '../../models/notification.model';
import { Subject, forkJoin, of, interval, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { WorkspaceDialogComponent } from '../../../features/workspace/workspace-dialog/workspace-dialog.component';
import { UserProfilePreviewComponent } from '../../../shared/components/add-member-dialog/user-profile-preview/user-profile-preview.component';
import { ArchivedCardsDialogComponent } from '../../../features/profile/archived-cards-dialog/archived-cards-dialog.component';

export interface SearchItem {
  id: number;
  type: 'WORKSPACE' | 'BOARD' | 'CARD';
  title: string;
  subtitle: string;
  url: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatToolbarModule, MatIconModule, MatButtonModule, 
    MatMenuModule, MatDividerModule, MatInputModule, MatBadgeModule, MatProgressSpinnerModule, MatDialogModule,
    UserProfilePreviewComponent, ArchivedCardsDialogComponent
  ],
  template: `
    <div class="flex flex-col h-screen overflow-hidden">
      <!-- Global Top Navbar -->
      <mat-toolbar 
        class="flex justify-between items-center border-b border-white/10 px-4 min-h-[56px] h-[56px] gap-4 transition-all duration-500 bg-cover bg-center relative"
        [style.background]="boardService.currentBoardBackground()?.startsWith('http') ? 'url(' + boardService.currentBoardBackground() + ')' : (boardService.currentBoardBackground() || '#ffffff')"
        [ngClass]="boardService.currentBoardBackground() ? 'text-white' : 'text-[#172b4d] bg-white'">
        
        <!-- Overlay for readability when background is present -->
        <div *ngIf="boardService.currentBoardBackground()" class="absolute inset-0 bg-black/40 backdrop-blur-md z-0"></div>
        <!-- Left: Logo -->
        <div class="flex items-center gap-1 shrink-0 relative z-10">
          <div class="flex items-center gap-1 font-bold text-xl cursor-pointer" routerLink="/dashboard">
            <mat-icon [ngClass]="boardService.currentBoardBackground() ? 'text-white' : 'text-[#0c66e4]'">view_kanban</mat-icon>
            <span class="tracking-tight text-xl" [ngClass]="boardService.currentBoardBackground() ? 'text-white' : 'text-[#172b4d]'">Zask</span>
          </div>
        </div>

        <!-- Middle: Search Bar (Centered) -->
        <div class="flex-1 max-w-[600px] flex justify-center relative z-10">
          <div class="flex items-center rounded-lg px-3 w-full max-w-[500px] transition-all h-9 group shadow-sm"
               [ngClass]="boardService.currentBoardBackground() ? 'bg-white/20 focus-within:bg-white/30 border-white/10' : 'bg-gray-100/80 border-transparent focus-within:bg-white focus-within:border-[#0c66e4] focus-within:ring-2 focus-within:ring-blue-100'">
            <mat-icon class="text-[20px] w-5 h-5 mr-2"
                      [ngClass]="boardService.currentBoardBackground() ? 'text-white' : 'text-gray-500 group-focus-within:text-[#0c66e4]'">search</mat-icon>
            <input type="text" placeholder="Search anything..." 
                   class="border-none bg-transparent w-full h-full outline-none font-normal text-sm"
                   [ngClass]="boardService.currentBoardBackground() ? 'text-white placeholder:text-white/70' : 'text-[#172b4d] placeholder:text-gray-500'"
                   (input)="onSearchInput($event)"
                   (focus)="showSearchDropdown.set(true)"
                   (blur)="hideSearchDropdown()">
          </div>
          
          <!-- Search Results Dropdown -->
          <div *ngIf="showSearchDropdown() && (searchQuery() || searchResults().length > 0)" 
               class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[500px] max-h-[450px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-y-auto z-[200] py-3 animate-in fade-in slide-in-from-top-2 duration-200"
               (mousedown)="$event.preventDefault()">
            
            <div *ngIf="isSearching()" class="p-6 flex justify-center items-center">
              <mat-spinner diameter="32" color="primary"></mat-spinner>
            </div>
            
            <div *ngIf="!isSearching() && searchQuery() && searchResults().length === 0" class="p-8 text-center">
              <mat-icon class="text-gray-300 text-4xl mb-2">search_off</mat-icon>
              <div class="text-gray-500 text-sm">No results found for "<span class="font-bold">{{ searchQuery() }}</span>"</div>
            </div>
            
            <ng-container *ngIf="!isSearching() && searchResults().length > 0">
              <div class="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Results</div>
              <div *ngFor="let item of searchResults()" 
                   (click)="navigateToResult(item.url)"
                   class="px-4 py-3 hover:bg-blue-50/50 cursor-pointer flex items-center gap-4 transition-colors group">
                 <div class="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center shrink-0 text-gray-500 group-hover:text-blue-600 transition-colors">
                   <mat-icon class="!text-[20px] !w-5 !h-5">{{ getSearchIcon(item.type) }}</mat-icon>
                 </div>
                 <div class="flex-1 overflow-hidden">
                   <div class="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700">{{ item.title }}</div>
                   <div class="text-xs text-gray-500 truncate">{{ item.subtitle }}</div>
                 </div>
                 <mat-icon class="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity !text-[18px] !w-[18px] !h-[18px]">chevron_right</mat-icon>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Right: Actions & Profile -->
        <div class="flex items-center gap-1 shrink-0 relative z-10">


          <button mat-icon-button [matMenuTriggerFor]="notifMenu" class="!w-10 !h-10 leading-[40px] rounded-full shrink-0 relative"
                  [ngClass]="boardService.currentBoardBackground() ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'">
            <mat-icon class="!text-[24px] !w-6 !h-6" 
                      [matBadge]="unreadCount() > 0 ? unreadCount() : null" 
                      matBadgeColor="warn" 
                      matBadgeSize="small">notifications_none</mat-icon>
          </button>
          
          <!-- Notifications Menu -->
          <mat-menu #notifMenu="matMenu" xPosition="before" class="w-[350px]">
            <div class="flex justify-between items-center px-4 py-2 font-bold" (click)="$event.stopPropagation()">
              <span>Notifications</span>
              <button mat-button class="text-xs" (click)="markAllRead()">Mark all as read</button>
            </div>
            <mat-divider></mat-divider>
            <div class="max-h-[380px] overflow-y-auto" (click)="$event.stopPropagation()">
              <div class="p-8 text-center text-gray-400" *ngIf="notifications().length === 0">
                <mat-icon class="!text-[40px] !w-10 !h-10 mb-2 opacity-20">notifications_none</mat-icon>
                <div class="text-sm font-medium">No new notifications</div>
              </div>
              <div class="p-4 border-b border-gray-50 flex items-start gap-3 hover:bg-blue-50/30 transition-all cursor-pointer group" 
                   *ngFor="let n of notifications()" 
                   [ngClass]="{'bg-blue-50/50 font-medium': !n.isRead}"
                   (click)="handleNotificationClick(n)">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                     [ngClass]="n.recipientId === -1 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">
                  <mat-icon class="!text-[16px] !w-4 !h-4">{{ n.recipientId === -1 ? 'campaign' : 'notifications' }}</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5" *ngIf="n.recipientId === -1">
                    <span class="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-red-600 text-white uppercase tracking-wider">Broadcast</span>
                  </div>
                  <div class="text-[13px] text-gray-800 leading-tight">{{n.message}}</div>
                  <div class="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <mat-icon class="!text-[10px] !w-2.5 !h-2.5">schedule</mat-icon>
                    {{n.createdAt | date:'medium'}}
                  </div>
                </div>
                <button mat-icon-button class="!w-6 !h-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                        *ngIf="!n.isRead" (click)="markAsRead(n.notificationId); $event.stopPropagation()">
                  <mat-icon class="text-[14px] w-3.5 h-3.5 text-blue-600">check_circle</mat-icon>
                </button>
              </div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/notifications" class="text-center text-orange-600 font-semibold w-full">View All Notifications</button>
          </mat-menu>
          


          <!-- User Profile Dropdown -->
          <button mat-icon-button [matMenuTriggerFor]="profileMenu" class="!w-9 !h-9 ml-1 shrink-0">
            <div class="w-8 h-8 rounded-full bg-[#d93a00] text-white flex items-center justify-center font-bold text-sm shadow-sm border-2"
                 [ngClass]="boardService.currentBoardBackground() ? 'border-white/40' : 'border-transparent'">{{ userInitials() }}</div>
          </button>
        </div>
          
          <mat-menu #profileMenu="matMenu" xPosition="before" class="w-[304px] py-2 mt-1 rounded-lg">
            <div class="px-4 py-2">
              <div class="text-xs font-bold text-gray-500 mb-2">ACCOUNT</div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#d93a00] text-white flex items-center justify-center font-bold text-sm shrink-0">{{ userInitials() }}</div>
                <div class="flex flex-col overflow-hidden">
                  <span class="font-medium text-[#172b4d] text-sm truncate">{{ authService.currentUser()?.fullName }}</span>
                  <span class="text-xs text-gray-500 truncate">{{ authService.currentUser()?.email }}</span>
                </div>
              </div>
            </div>
            
            <mat-divider class="!my-2"></mat-divider>
            
            <div class="px-4 py-2">
              <div class="text-xs font-bold text-gray-500">ZASK</div>
            </div>
            
            <button mat-menu-item routerLink="/profile" class="!h-10 !leading-10 !text-sm text-[#172b4d]">
              <span>Profile and visibility</span>
            </button>
            <button mat-menu-item routerLink="/dashboard" [queryParams]="{tab: 'activity'}" class="!h-10 !leading-10 !text-sm text-[#172b4d]">
              <span>Activity</span>
            </button>
            <button mat-menu-item routerLink="/dashboard" [queryParams]="{tab: 'cards'}" class="!h-10 !leading-10 !text-sm text-[#172b4d]">
              <span>Cards</span>
            </button>
            <button mat-menu-item (click)="openArchivedCardsDialog()" class="!h-10 !leading-10 !text-sm text-[#172b4d]">
              <span>Archived Items</span>
            </button>
            <button mat-menu-item routerLink="/settings" class="!h-10 !leading-10 !text-sm text-[#172b4d]">
              <span>Settings</span>
            </button>
            
            <mat-divider class="!my-2"></mat-divider>
            
            
            <button mat-menu-item class="!h-10 !leading-10 !text-sm text-[#172b4d]" (click)="openCreateWorkspaceDialog()">
              <div class="flex items-center gap-2">
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-gray-600">people</mat-icon>
                <span>Create Workspace</span>
              </div>
            </button>
            
            <mat-divider class="!my-2" *ngIf="authService.currentUser()?.role === 'PLATFORM_ADMIN'"></mat-divider>
            
            <button mat-menu-item *ngIf="authService.currentUser()?.role === 'PLATFORM_ADMIN'" 
                    routerLink="/admin" class="!h-10 !leading-10 !text-sm text-[#172b4d]">
              <div class="flex items-center gap-2">
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-[#0c66e4]">shield</mat-icon>
                <span class="font-bold text-[#0c66e4]">Admin Panel</span>
              </div>
            </button>
 
            <mat-divider class="!my-2"></mat-divider>
            
            <button mat-menu-item (click)="logout()" class="!h-10 !leading-10 !text-sm text-[#172b4d]">
              <span>Log out</span>
            </button>
          </mat-menu>
      </mat-toolbar>

      <!-- Main Content Outlet -->
      <div class="flex-1 flex flex-col bg-transparent" [ngClass]="boardService.currentBoardBackground() ? 'overflow-y-hidden' : 'overflow-y-auto'">
        <router-outlet></router-outlet>
      </div>
    </div>

    <!-- Global User Profile Preview Popup (rendered once at root) -->
    <app-user-profile-preview></app-user-profile-preview>
  `,
  styles: []
})
export class MainLayoutComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private workspaceService = inject(WorkspaceService);
  public boardService = inject(BoardService);
  private cardService = inject(CardService);
  private dialog = inject(MatDialog);

  private pollingSub?: Subscription;

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  // Search State
  searchQuery = signal<string>('');
  searchResults = signal<SearchItem[]>([]);
  isSearching = signal<boolean>(false);
  showSearchDropdown = signal<boolean>(false);
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.startNotificationPolling();
    
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          return of([]);
        }
        this.isSearching.set(true);
        return forkJoin({
          workspaces: this.workspaceService.searchWorkspaces(query).pipe(catchError(() => of([]))),
          boards: this.boardService.searchBoards(query).pipe(catchError(() => of([]))),
          cards: this.cardService.searchCards(query).pipe(catchError(() => of([])))
        });
      })
    ).subscribe(results => {
      this.isSearching.set(false);
      if (Array.isArray(results)) {
        this.searchResults.set([]);
        return;
      }
      
      const items: SearchItem[] = [];
      
      results.workspaces.forEach((w: any) => items.push({
        id: w.workspaceId,
        type: 'WORKSPACE',
        title: w.name,
        subtitle: 'Workspace',
        url: `/workspace/${w.workspaceId}`
      }));
      
      results.boards.forEach((b: any) => items.push({
        id: b.boardId,
        type: 'BOARD',
        title: b.name,
        subtitle: 'Board',
        url: `/board/${b.boardId}`
      }));
      
      results.cards.forEach((c: any) => items.push({
        id: c.cardId,
        type: 'CARD',
        title: c.title,
        subtitle: `Card on Board ID ${c.boardId}`,
        url: `/board/${c.boardId}`
      }));
      
      this.searchResults.set(items);
    });
  }

  onSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.searchSubject.next(query);
    if (query.trim() !== '') {
      this.showSearchDropdown.set(true);
    }
  }

  hideSearchDropdown() {
    setTimeout(() => {
      this.showSearchDropdown.set(false);
    }, 200);
  }

  navigateToResult(url: string) {
    this.showSearchDropdown.set(false);
    this.searchQuery.set('');
    this.router.navigateByUrl(url);
  }

  getSearchIcon(type: string): string {
    switch(type) {
      case 'WORKSPACE': return 'domain';
      case 'BOARD': return 'dashboard';
      case 'CARD': return 'payment';
      default: return 'search';
    }
  }

  startNotificationPolling() {
    // Initial load
    this.loadNotifications();
    
    // Poll every 30 seconds
    this.pollingSub = interval(30000).pipe(
      startWith(0)
    ).subscribe(() => {
      this.loadNotifications();
    });
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  loadNotifications() {
    const user = this.authService.currentUser();
    if (user) {
      this.notificationService.getByRecipient(user.id).subscribe(res => {
        const sorted = res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notifications.set(sorted);
        this.unreadCount.set(res.filter(n => !n.isRead).length);
      });
    }
  }

  handleNotificationClick(n: Notification) {
    if (!n.isRead) {
      this.markAsRead(n.notificationId);
    }
    
    // Handle deep linking
    if (n.relatedType === 'BOARD' && n.relatedId) {
      this.router.navigate(['/board', n.relatedId]);
    } else if (n.relatedType === 'CARD' && n.relatedId) {
      // Assuming card notifications should take you to the board they are on
      // This would ideally be a more specific deep link
      this.router.navigate(['/board', n.relatedId]);
    }
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe(() => {
      // Optimistic update
      this.notifications.update(list => list.map(n => n.notificationId === id ? {...n, isRead: true} : n));
      this.unreadCount.update(c => Math.max(0, c - 1));
    });
  }

  markAllRead() {
    const user = this.authService.currentUser();
    if (user) {
      this.notificationService.markAllAsRead(user.id).subscribe(() => {
        this.notifications.update(list => list.map(n => ({...n, isRead: true})));
        this.unreadCount.set(0);
      });
    }
  }

  userInitials(): string {
    const name = this.authService.currentUser()?.fullName || 'User';
    const split = name.split(' ');
    if (split.length > 1) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  logout() {
    this.authService.logout();
  }

  openCreateWorkspaceDialog() {
    const dialogRef = this.dialog.open(WorkspaceDialogComponent, {
      width: '850px',
      maxWidth: '90vw'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const currentUser = this.authService.currentUser();
        this.workspaceService.createWorkspace({
          name: result.name,
          description: result.description,
          visibility: result.visibility,
          ownerId: currentUser?.id || 1
        }).subscribe({
          next: (ws) => {
             this.router.navigate(['/dashboard']).then(() => {
               window.location.reload(); 
             });
          }
        });
      }
    });
  }

  openArchivedCardsDialog() {
    this.dialog.open(ArchivedCardsDialogComponent, {
      width: '550px',
      maxWidth: '90vw'
    });
  }
}
