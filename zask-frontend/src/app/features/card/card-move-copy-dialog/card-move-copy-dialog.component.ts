import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { BoardService } from '../../../core/services/board.service';
import { ListService } from '../../../core/services/list.service';
import { CardService } from '../../../core/services/card.service';
import { LabelService } from '../../../core/services/label.service';
import { AuthService } from '../../../core/services/auth.service';
import { Workspace } from '../../../core/models/workspace.model';
import { Board } from '../../../core/models/board.model';
import { TaskList } from '../../../core/models/list.model';
import { Card } from '../../../core/models/card.model';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-card-move-copy-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="p-6 font-sans">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-800 m-0">
          {{ data.action === 'MOVE' ? 'Move Card' : 'Copy Card' }}
        </h2>
        <button mat-icon-button (click)="close()" class="text-slate-400 hover:text-slate-600">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="flex flex-col gap-4" *ngIf="!isProcessing()">
        <!-- Workspace Selection -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace</label>
          <select [(ngModel)]="selectedWorkspaceId" 
                  (change)="onWorkspaceChange()"
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option [value]="null" disabled>Select target workspace</option>
            <option *ngFor="let ws of workspaces" [value]="ws.workspaceId">{{ ws.name }}</option>
          </select>
        </div>

        <!-- Board Selection -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Board</label>
          <select [(ngModel)]="selectedBoardId" 
                  (change)="onBoardChange()"
                  [disabled]="!selectedWorkspaceId"
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
            <option [value]="null" disabled>Select target board</option>
            <option *ngFor="let b of boards" [value]="b.boardId">{{ b.name }}</option>
          </select>
        </div>

        <!-- List Selection (If lists exist) -->
        <div *ngIf="selectedBoardId && !showCreateListInput">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">List / Column</label>
          <select [(ngModel)]="selectedListId" 
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option [value]="null" disabled>Select target list</option>
            <option *ngFor="let l of lists" [value]="l.listId">{{ l.name }}</option>
          </select>
        </div>

        <!-- Create List Input (If no lists exist) -->
        <div *ngIf="selectedBoardId && showCreateListInput" class="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col gap-2">
          <div class="text-xs font-semibold text-blue-800">
            This board has no lists yet. Enter a list name to create it and move/copy the card there:
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">New List Name</label>
            <input type="text" 
                   [(ngModel)]="newListName"
                   placeholder="e.g. To Do"
                   class="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
      </div>

      <!-- Loading spinner during process -->
      <div class="flex flex-col items-center justify-center py-8 gap-3" *ngIf="isProcessing()">
        <mat-spinner diameter="36" color="primary"></mat-spinner>
        <div class="text-xs font-medium text-slate-500">
          {{ data.action === 'MOVE' ? 'Moving card...' : 'Copying card and checklist items...' }}
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 mt-8" *ngIf="!isProcessing()">
        <button mat-button class="!rounded-xl !py-5" (click)="close()">Cancel</button>
        <button mat-flat-button color="primary" 
                class="!rounded-xl !py-5 !bg-blue-600"
                [disabled]="!selectedBoardId || (showCreateListInput && !newListName.trim()) || (!showCreateListInput && !selectedListId)"
                (click)="submit()">
          {{ data.action === 'MOVE' ? 'Move' : 'Copy' }}
        </button>
      </div>
    </div>
  `
})
export class CardMoveCopyDialogComponent implements OnInit {
  workspaces: Workspace[] = [];
  boards: Board[] = [];
  lists: TaskList[] = [];

  selectedWorkspaceId: number | null = null;
  selectedBoardId: number | null = null;
  selectedListId: number | null = null;

  newListName: string = '';
  showCreateListInput: boolean = false;

  isProcessing = signal(false);

  constructor(
    public dialogRef: MatDialogRef<CardMoveCopyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { card: Card, action: 'MOVE' | 'COPY', currentWorkspaceId?: number, currentBoardId: number, currentListId: number },
    private workspaceService: WorkspaceService,
    private boardService: BoardService,
    private listService: ListService,
    private cardService: CardService,
    private labelService: LabelService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadWorkspaces();
  }

  loadWorkspaces() {
    const userId = this.authService.currentUser()?.id || 1;
    forkJoin({
      owned: this.workspaceService.getWorkspacesByOwner(userId).pipe(catchError(() => of([]))),
      member: this.workspaceService.getWorkspacesByMember(userId).pipe(catchError(() => of([])))
    }).subscribe({
      next: (results) => {
        const combined = [...results.owned, ...results.member];
        // Deduplicate workspaces
        this.workspaces = Array.from(new Map(combined.map(ws => [ws.workspaceId, ws])).values());
        
        // Auto-select current workspace if workspace details are not explicitly provided
        if (this.data.currentWorkspaceId) {
          this.selectedWorkspaceId = this.data.currentWorkspaceId;
          this.loadBoards(this.selectedWorkspaceId);
        } else {
          // If workspaceId is not passed, let's fetch the board to find its workspaceId
          this.boardService.getBoardById(this.data.currentBoardId).subscribe(board => {
            this.selectedWorkspaceId = board.workspaceId;
            this.loadBoards(board.workspaceId);
          });
        }
      }
    });
  }

  loadBoards(workspaceId: number) {
    this.boardService.getBoardsByWorkspace(workspaceId).subscribe(boards => {
      this.boards = boards;
      this.selectedBoardId = this.data.currentBoardId;
      this.loadLists(this.data.currentBoardId);
    });
  }

  loadLists(boardId: number) {
    this.listService.getListsByBoard(boardId).subscribe(lists => {
      this.lists = lists.sort((a, b) => a.position - b.position);
      if (this.lists.length > 0) {
        this.selectedListId = this.data.currentListId;
        if (!this.lists.some(l => l.listId === this.selectedListId)) {
          this.selectedListId = this.lists[0].listId;
        }
        this.showCreateListInput = false;
      } else {
        this.selectedListId = null;
        this.showCreateListInput = true;
        this.newListName = 'To Do';
      }
    });
  }

  onWorkspaceChange() {
    this.selectedBoardId = null;
    this.selectedListId = null;
    this.boards = [];
    this.lists = [];
    this.showCreateListInput = false;
    if (this.selectedWorkspaceId) {
      this.boardService.getBoardsByWorkspace(this.selectedWorkspaceId).subscribe(boards => {
        this.boards = boards;
      });
    }
  }

  onBoardChange() {
    this.selectedListId = null;
    this.lists = [];
    this.showCreateListInput = false;
    if (this.selectedBoardId) {
      this.loadLists(this.selectedBoardId);
    }
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
    if (!this.selectedBoardId) return;
    this.isProcessing.set(true);

    if (this.showCreateListInput) {
      const listName = this.newListName.trim();
      if (!listName) {
        this.snackBar.open('Please enter a list name', 'OK', { duration: 3000 });
        this.isProcessing.set(false);
        return;
      }

      // Create new list first
      this.listService.createList({ boardId: this.selectedBoardId, name: listName, position: 0 }).subscribe({
        next: (newList) => {
          if (this.data.action === 'MOVE') {
            this.performMove(newList.listId);
          } else {
            this.performCopy(newList.listId);
          }
        },
        error: () => {
          this.snackBar.open('Failed to create new list column', 'OK', { duration: 3000 });
          this.isProcessing.set(false);
        }
      });
    } else {
      if (!this.selectedListId) {
        this.snackBar.open('Please select a target list', 'OK', { duration: 3000 });
        this.isProcessing.set(false);
        return;
      }

      if (this.data.action === 'MOVE') {
        this.performMove(this.selectedListId);
      } else {
        this.performCopy(this.selectedListId);
      }
    }
  }

  private migrateLabels(cardId: number, sourceBoardId: number, targetBoardId: number): Observable<any> {
    if (sourceBoardId === targetBoardId) {
      return of(null);
    }

    // 1. Fetch current labels on the card
    return this.labelService.getLabelsForCard(cardId).pipe(
      switchMap(currentLabels => {
        if (!currentLabels || currentLabels.length === 0) {
          return of(null);
        }

        // 2. Fetch all labels of the target board
        return this.labelService.getLabelsByBoard(targetBoardId).pipe(
          switchMap(targetBoardLabels => {
            const labelTasks = currentLabels.map(cl => {
              const matchingLabel = targetBoardLabels.find(
                tbl => tbl.name.toLowerCase() === cl.name.toLowerCase() && tbl.color.toLowerCase() === cl.color.toLowerCase()
              );

              if (matchingLabel) {
                // Match found: link target label and unlink source label
                return this.labelService.addLabelToCard(cardId, matchingLabel.labelId).pipe(
                  switchMap(() => this.labelService.removeLabelFromCard(cardId, cl.labelId).pipe(catchError(() => of(null)))),
                  catchError(() => of(null))
                );
              } else {
                // Match not found: create label on target board, link it, and unlink source label
                return this.labelService.createLabel({
                  boardId: targetBoardId,
                  name: cl.name,
                  color: cl.color
                }).pipe(
                  switchMap(newLabel => 
                    this.labelService.addLabelToCard(cardId, newLabel.labelId).pipe(
                      switchMap(() => this.labelService.removeLabelFromCard(cardId, cl.labelId).pipe(catchError(() => of(null))))
                    )
                  ),
                  catchError(() => of(null))
                );
              }
            });

            return forkJoin(labelTasks);
          })
        );
      }),
      catchError(() => of(null))
    );
  }

  private performMove(targetListId: number) {
    this.cardService.getCardsByList(targetListId).subscribe(cards => {
      const position = cards.length;
      const originalBoardId = this.data.card.boardId;

      this.cardService.moveCard(this.data.card.cardId, targetListId, position, this.selectedBoardId!).subscribe({
        next: () => {
          // Perform label migration across boards if board changed
          this.migrateLabels(this.data.card.cardId, originalBoardId, this.selectedBoardId!).subscribe({
            next: () => {
              this.snackBar.open('Card moved successfully', 'OK', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: () => {
              this.snackBar.open('Card moved, but some labels could not be migrated', 'OK', { duration: 3000 });
              this.dialogRef.close(true);
            }
          });
        },
        error: () => {
          this.snackBar.open('Failed to move card', 'OK', { duration: 3000 });
          this.isProcessing.set(false);
        }
      });
    });
  }

  private performCopy(targetListId: number) {
    this.cardService.getCardsByList(targetListId).subscribe(cards => {
      const position = cards.length;
      const copyPayload: Partial<Card> = {
        boardId: this.selectedBoardId!,
        listId: targetListId,
        title: this.data.card.title,
        position: position,
        priority: this.data.card.priority || 'MEDIUM',
        status: this.data.card.status || 'TO_DO',
        description: this.data.card.description || '',
        startDate: this.data.card.startDate,
        dueDate: this.data.card.dueDate,
        coverColor: this.data.card.coverColor,
        coverSize: this.data.card.coverSize,
        assigneeId: this.data.card.assigneeId,
        createdById: this.authService.currentUser()?.id || this.authService.currentUser()?.userId || 1
      };

      // 1. Create duplicate card
      this.cardService.createCard(copyPayload).pipe(
        switchMap(newCard => {
          // 2. Fetch original card labels
          return this.labelService.getLabelsForCard(this.data.card.cardId).pipe(
            switchMap(labels => {
              if (!labels || labels.length === 0) {
                return of(newCard);
              }

              // 3. Fetch target board's labels to see what we can reuse or need to create
              return this.labelService.getLabelsByBoard(this.selectedBoardId!).pipe(
                switchMap(targetBoardLabels => {
                  const labelRequests = labels.map(l => {
                    const matchingLabel = targetBoardLabels.find(
                      tbl => tbl.name.toLowerCase() === l.name.toLowerCase() && tbl.color.toLowerCase() === l.color.toLowerCase()
                    );

                    if (matchingLabel) {
                      return this.labelService.addLabelToCard(newCard.cardId, matchingLabel.labelId).pipe(catchError(() => of(null)));
                    } else {
                      return this.labelService.createLabel({
                        boardId: this.selectedBoardId!,
                        name: l.name,
                        color: l.color
                      }).pipe(
                        switchMap(newLabel => this.labelService.addLabelToCard(newCard.cardId, newLabel.labelId)),
                        catchError(() => of(null))
                      );
                    }
                  });
                  return (labelRequests.length > 0 ? forkJoin(labelRequests) : of([])).pipe(map(() => newCard));
                })
              );
            }),
            catchError(() => of(newCard)),
            switchMap(newCard => {
              // 4. Fetch original card checklists
              return this.labelService.getChecklistsByCard(this.data.card.cardId).pipe(
                switchMap(checklists => {
                  const checklistRequests = checklists.map(cl => {
                    return this.labelService.createChecklist({ cardId: newCard.cardId, title: cl.title }).pipe(
                      switchMap(newCl => {
                        const itemRequests = (cl.items || []).map(cli => 
                          this.labelService.addItem(newCl.checklistId, { text: cli.text, isCompleted: cli.isCompleted }).pipe(catchError(() => of(null)))
                        );
                        return itemRequests.length > 0 ? forkJoin(itemRequests) : of([]);
                      }),
                      catchError(() => of(null))
                    );
                  });
                  return checklistRequests.length > 0 ? forkJoin(checklistRequests) : of([]);
                })
              );
            })
          );
        })
      ).subscribe({
        next: () => {
          this.snackBar.open('Card copied successfully', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to copy card', 'OK', { duration: 3000 });
          this.isProcessing.set(false);
        }
      });
    });
  }
}
