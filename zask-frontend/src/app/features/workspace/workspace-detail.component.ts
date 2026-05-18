import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BoardService } from '../../core/services/board.service';
import { Board } from '../../core/models/board.model';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Workspace, WorkspaceMember } from '../../core/models/workspace.model';
import { AuthService } from '../../core/services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BoardDialogComponent } from './board-dialog/board-dialog.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog/confirm-dialog.component';
import { ClosedBoardsDialogComponent } from './closed-boards-dialog/closed-boards-dialog.component';

@Component({
  selector: 'app-workspace-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule, 
    MatIconModule, MatProgressSpinnerModule, MatToolbarModule,
    MatDialogModule
  ],
  template: `
    <div class="p-12 max-w-[1200px] font-sans">
      
      <!-- Workspace Header -->
      <div class="mb-10">
        <h1 class="text-3xl font-extrabold text-[#172b4d] mb-2">{{ workspace()?.name }} Boards</h1>
        <p class="text-gray-500 text-sm">{{ workspace()?.description || "It's just a demo to check how each functionality is working" }}</p>
      </div>

      <!-- Filters & Search -->
      <div class="flex flex-wrap items-end gap-6 mb-10">
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sort By</label>
          <select class="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-[#172b4d] w-[200px] outline-none focus:border-blue-500 shadow-sm transition-all">
            <option>Most recently active</option>
            <option>Least recently active</option>
            <option>Alphabetical A-Z</option>
            <option>Alphabetical Z-A</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5 flex-1 max-w-[300px]">
          <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Search</label>
          <div class="relative">
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 !text-[18px] !w-[18px] !h-[18px] text-gray-400">search</mat-icon>
            <input type="text" placeholder="Search boards" 
                   class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm text-[#172b4d] outline-none focus:border-blue-500 shadow-sm transition-all">
          </div>
        </div>
      </div>

      <div class="flex justify-center p-16" *ngIf="isLoading()">
        <mat-spinner diameter="40" color="accent"></mat-spinner>
      </div>

      <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6" *ngIf="!isLoading()">
        
        <!-- Create Board Card -->
        <div *ngIf="isWorkspaceAdmin() && !isGuest()" 
             (click)="createNewBoard()"
             class="h-[140px] cursor-pointer rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all group">
          <mat-icon class="text-gray-400 group-hover:text-blue-500 mb-2">add</mat-icon>
          <span class="text-sm font-bold text-gray-500 group-hover:text-blue-600">Create new board</span>
        </div>

        <!-- Board Cards (Open) -->
        <div *ngFor="let board of openBoards()" 
             (click)="goToBoard(board.boardId)"
             class="h-[100px] cursor-pointer rounded-xl p-4 flex flex-col justify-start transition-all hover:translate-y-[-4px] hover:shadow-lg relative overflow-hidden group shadow-sm"
             [style.background]="board.background || '#0079bf'">
          
          <!-- Content -->
          <h3 class="relative text-white font-bold text-base m-0 drop-shadow-md leading-tight">{{ board.name }}</h3>
        </div>
      </div>

      <!-- Closed Boards Toggle -->
      <div *ngIf="!isLoading() && isWorkspaceAdmin()" class="mt-16 pt-8">
        <button mat-stroked-button class="!bg-white !text-gray-600 !border-gray-300 !rounded-lg !px-4 !py-2 hover:!bg-gray-50 transition-colors" (click)="openClosedBoardsDialog()">
          View all closed boards
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && openBoards().length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <mat-icon class="!w-16 !h-16 !text-[64px] text-gray-200 mb-4">dashboard</mat-icon>
        <h3 class="text-xl font-bold text-gray-600">No active boards yet</h3>
        <p class="text-gray-400 mt-2">Create your first board or check closed boards!</p>
      </div>
    </div>
  `,
  styles: []
})
export class WorkspaceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(BoardService);
  private workspaceService = inject(WorkspaceService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  workspaceId = signal<number | null>(null);
  workspace = signal<Workspace | null>(null);
  boards = signal<Board[]>([]);
  isLoading = signal(true);
  isWorkspaceAdmin = signal(false);
  isGuest = computed(() => !this.authService.isAuthenticated());
  
  showClosedBoards = signal(false);

  openBoards = computed(() => this.boards().filter(b => !b.isClosed && !(b as any).closed));
  closedBoards = computed(() => this.boards().filter(b => b.isClosed || (b as any).closed));

  ngOnInit() {
    // Listen to parent route params for the workspace ID
    this.route.parent?.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.workspaceId.set(+id);
        this.loadData(+id);
      } else {
        this.isLoading.set(false);
      }
    });
  }

  loadData(workspaceId: number) {
    this.isLoading.set(true);
    
    // Use forkJoin to load all data and stop loading once all are done
    forkJoin({
      workspace: this.workspaceService.getById(workspaceId).pipe(catchError(() => of(null))),
      boards: this.boardService.getBoardsByWorkspace(workspaceId).pipe(catchError(() => of([]))),
      members: this.workspaceService.getMembers(workspaceId).pipe(catchError(() => of([])))
    }).subscribe({
      next: (results) => {
        this.workspace.set(results.workspace);
        this.boards.set(results.boards);
        
        const currentUser = this.authService.currentUser();
        if (currentUser && results.workspace) {
          const userMember = results.members.find(m => m.userId === currentUser.id);
          const isOwner = results.workspace.ownerId === currentUser.id;
          const isGlobalAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'PLATFORM_ADMIN';
          this.isWorkspaceAdmin.set(userMember?.role === 'ADMIN' || isOwner || isGlobalAdmin);
        }
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading workspace data:', err);
        this.isLoading.set(false);
      }
    });
  }

  createNewBoard() {
    const wsId = this.workspaceId();
    if (!wsId) return;

    const dialogRef = this.dialog.open(BoardDialogComponent, {
      width: '400px',
      data: {
        workspaceId: wsId,
        workspaces: this.workspace() ? [this.workspace()] : []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const payload = {
          ...result,
          createdById: this.authService.currentUser()?.id || 1
        };

        this.boardService.createBoard(payload).subscribe({
          next: (board: Board) => {
            this.boards.update(b => [...b, board]);
          }
        });
      }
    });
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
          this.loadData(this.workspaceId()!);
        }
      }
    });
  }

  reopenBoard(event: Event, boardId: number) {
    event.stopPropagation();
    const board = this.boards().find(b => b.boardId === boardId);
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reopen Board',
        message: `Are you sure you want to reopen board "${board?.name}"?`,
        confirmText: 'Reopen Board',
        isDestructive: false
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardService.reopenBoard(boardId).subscribe(() => {
          this.boards.update(boards => 
            boards.map(b => b.boardId === boardId ? { ...b, isClosed: false } : b)
          );
        });
      }
    });
  }

  goToBoard(boardId: number) {
    const board = this.boards().find(b => b.boardId === boardId);
    if (board?.isClosed) {
      return; // Can't go to closed board
    }
    this.router.navigate(['/board', boardId]);
  }
}
