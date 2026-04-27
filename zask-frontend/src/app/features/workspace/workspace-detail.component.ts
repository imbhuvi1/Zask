import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BoardService } from '../../../core/services/board.service';
import { Board } from '../../../core/models/board.model';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { Workspace } from '../../../core/models/workspace.model';

@Component({
  selector: 'app-workspace-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatToolbarModule],
  template: `
    <mat-toolbar color="primary" class="detail-toolbar">
      <button mat-icon-button routerLink="/dashboard">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span class="workspace-name">{{ workspace()?.name || 'Loading Workspace...' }}</span>
    </mat-toolbar>

    <div class="boards-container">
      <div class="header-actions">
        <h2>Boards</h2>
        <button mat-flat-button color="accent" (click)="createNewBoard()">
          <mat-icon>add</mat-icon> Create Board
        </button>
      </div>

      <div class="loading-state" *ngIf="isLoading()">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="boards-grid" *ngIf="!isLoading()">
        <mat-card class="board-card new-board-card" (click)="createNewBoard()">
          <mat-icon>add</mat-icon>
          <span>Create new board</span>
        </mat-card>

        <mat-card class="board-card" *ngFor="let board of boards()" 
                 [style.background]="board.background || '#1e3c72'"
                 (click)="goToBoard(board.boardId)">
          <div class="board-overlay">
            <mat-card-title>{{ board.name }}</mat-card-title>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .detail-toolbar { gap: 16px; }
    .workspace-name { font-weight: 500; font-size: 20px; }
    .boards-container { padding: 40px; max-width: 1200px; margin: 0 auto; }
    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    
    .boards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .board-card {
      height: 120px;
      cursor: pointer;
      border-radius: 8px;
      color: white;
      transition: transform 0.2s, box-shadow 0.2s;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      }
    }

    .board-overlay {
      background: rgba(0,0,0,0.2);
      width: 100%;
      height: 100%;
      padding: 16px;
      box-sizing: border-box;

      &:hover { background: rgba(0,0,0,0.3); }

      mat-card-title {
        color: white;
        margin: 0;
        font-weight: 600;
        font-size: 18px;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      }
    }

    .new-board-card {
      background: rgba(0,0,0,0.05);
      color: #333;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: none;
      border: 2px dashed #ccc;

      mat-icon { margin-bottom: 8px; }
      span { font-weight: 500; }
      
      &:hover { background: rgba(0,0,0,0.08); }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 64px;
    }
  `]
})
export class WorkspaceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(BoardService);
  private workspaceService = inject(WorkspaceService);

  workspaceId = signal<number | null>(null);
  workspace = signal<Workspace | null>(null);
  boards = signal<Board[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workspaceId.set(+id);
      this.loadData(+id);
    }
  }

  loadData(workspaceId: number) {
    this.isLoading.set(true);
    // Fetch Workspace Info
    this.workspaceService.getById(workspaceId).subscribe({
      next: (ws) => this.workspace.set(ws),
      error: (err) => console.error(err)
    });

    // Fetch Boards
    this.boardService.getBoardsByWorkspace(workspaceId).subscribe({
      next: (boards) => {
        this.boards.set(boards);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  createNewBoard() {
    // In a real app, open a dialog here. For now, create immediately
    const wsId = this.workspaceId();
    if (!wsId) return;

    const newBoard = {
      workspaceId: wsId,
      name: 'New Project Board',
      background: '#1e3c72'
    };

    this.boardService.createBoard(newBoard).subscribe({
      next: (board) => {
        this.boards.update(b => [...b, board]);
      }
    });
  }

  goToBoard(boardId: number) {
    this.router.navigate(['/board', boardId]);
  }
}
