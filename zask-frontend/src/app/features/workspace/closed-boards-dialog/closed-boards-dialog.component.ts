import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BoardService } from '../../../core/services/board.service';
import { Board } from '../../../core/models/board.model';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-closed-boards-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-6 min-w-[500px] font-sans">
      <div class="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <div class="flex items-center gap-3">
          <mat-icon class="text-gray-600">inventory_2</mat-icon>
          <h2 class="text-xl font-bold text-[#172b4d] m-0">Closed boards</h2>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="text-gray-400">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
        <div *ngIf="closedBoards().length === 0" class="py-10 text-center text-gray-400 italic">
          No closed boards found.
        </div>

        <div *ngFor="let board of closedBoards()" class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
          <div class="flex items-center gap-4">
            <!-- Thumbnail -->
            <div class="w-12 h-8 rounded-md shadow-sm overflow-hidden flex-shrink-0" [style.background-color]="board.background || '#0079bf'">
              <div class="w-full h-full bg-black/10"></div>
            </div>
            
            <div class="flex flex-col">
              <span class="text-blue-600 font-semibold hover:underline cursor-pointer text-sm">{{ board.name }}</span>
              <span class="text-xs text-gray-500">{{ board.description || 'No description' }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button mat-flat-button color="primary" class="!px-4 !py-1 !text-sm !h-9" (click)="reopen(board)">
              Reopen
            </button>
            <button mat-flat-button color="warn" class="!px-4 !py-1 !text-sm !h-9 !bg-red-600" (click)="delete(board)">
              <mat-icon class="!mr-1">delete_outline</mat-icon>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-thin::-webkit-scrollbar { width: 6px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  `]
})
export class ClosedBoardsDialogComponent {
  public dialogRef = inject(MatDialogRef<ClosedBoardsDialogComponent>);
  private boardService = inject(BoardService);
  private dialog = inject(MatDialog);
  
  closedBoards = signal<Board[]>([]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { boards: Board[] }) {
    this.closedBoards.set(data.boards);
  }

  reopen(board: Board) {
    this.boardService.reopenBoard(board.boardId).subscribe(updatedBoard => {
      this.closedBoards.update(boards => boards.filter(b => b.boardId !== board.boardId));
      // Notify the parent component if needed, but for now we just update local state
      // Actually, it's better to pass back the action to the parent
      this.dialogRef.close({ action: 'reopen', boardId: board.boardId });
    });
  }

  delete(board: Board) {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Board',
        message: `Are you sure you want to permanently delete board "${board.name}"? This action cannot be undone.`,
        confirmText: 'Delete Board',
        isDestructive: true
      },
      maxWidth: '400px'
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardService.deleteBoard(board.boardId).subscribe(() => {
          this.closedBoards.update(boards => boards.filter(b => b.boardId !== board.boardId));
          this.dialogRef.close({ action: 'delete', boardId: board.boardId });
        });
      }
    });
  }
}
