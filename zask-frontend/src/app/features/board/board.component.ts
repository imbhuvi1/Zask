import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog/confirm-dialog.component';
import { BoardMember, Board } from '../../core/models/board.model';
import { User } from '../../core/models/user.model';
import { BoardService } from '../../core/services/board.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { ListService } from '../../core/services/list.service';
import { CardService } from '../../core/services/card.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { BoardVisibilityDialogComponent } from './board-visibility-dialog/board-visibility-dialog.component';
import { TaskList } from '../../core/models/list.model';
import { Card } from '../../core/models/card.model';
import { CardDetailDialogComponent } from '../card/card-detail-dialog/card-detail-dialog.component';
import { CardMoveCopyDialogComponent } from '../card/card-move-copy-dialog/card-move-copy-dialog.component';
import { LabelService } from '../../core/services/label.service';
import { ActivityService } from '../../core/services/activity.service';
import { ProfilePreviewService } from '../../core/services/profile-preview.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DragDropModule, FormsModule, 
    MatToolbarModule, MatIconModule, MatButtonModule, 
    MatCardModule, MatInputModule, MatProgressSpinnerModule,
    MatDialogModule, MatMenuModule, MatDividerModule, MatSnackBarModule,
    CardMoveCopyDialogComponent
  ],
  templateUrl: './board.component.html'
})
export class BoardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);
  private workspaceService = inject(WorkspaceService);
  private listService = inject(ListService);
  private cardService = inject(CardService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private labelService = inject(LabelService);
  private activityService = inject(ActivityService);
  profilePreviewService = inject(ProfilePreviewService);
  private snackBar = inject(MatSnackBar);
  public router = inject(Router);

  boardId: number | null = null;
  board = signal<Board | null>(null);
  
  // Data structure: a list of objects containing the list data and its array of cards
  boardLists = signal<{ list: TaskList, cards: Card[] }[]>([]);
  isLoading = signal(true);
  isBoardAdmin = signal(false);
  canEdit = signal(false);
  isGuest = computed(() => !this.authService.isAuthenticated());
  boardMembers = signal<any[]>([]);

  // New item states
  newListTitle = '';
  newCardTitles: { [listId: number]: string } = {};
  showAddListForm = false;
  showAddCardForm: { [listId: number]: boolean } = {};

  // Inline editing states
  editingCardId: number | null = null;
  editCardTitle = '';

  // Card Metadata Maps
  cardLabels = signal<{ [cardId: number]: number[] }>({});
  cardChecklistStats = signal<{ [cardId: number]: { completed: number, total: number, count: number } }>({});
  boardLabels = signal<any[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.boardId = +id;
      this.loadBoardData();
    }
  }

  ngOnDestroy() {
    // Reset global background when leaving the board
    this.boardService.currentBoardBackground.set(null);
  }

  loadBoardData() {
    if (!this.boardId) return;
    this.isLoading.set(true);

    this.boardService.getBoardById(this.boardId).subscribe(board => {
      this.board.set(board);
      
      // Load Lists
      this.listService.getListsByBoard(board.boardId).subscribe(lists => {
        // Sort lists by position
        lists.sort((a, b) => a.position - b.position);
        
        // Load Cards
        this.cardService.getCardsByBoard(board.boardId).subscribe(cards => {
          
          const structuredLists = lists.map(list => {
            const listCards = cards
              .filter(c => c.listId === list.listId && !c.isArchived)
              .sort((a, b) => a.position - b.position);
            return { list, cards: listCards };
          });

          this.boardLists.set(structuredLists);
          
          // Set global background for navbar sync
          this.boardService.currentBoardBackground.set(board.background || '#f1f2f4');

          // Fetch Labels for board
          this.labelService.getLabelsByBoard(board.boardId).subscribe(labels => {
            this.boardLabels.set(labels);
          });

          // Fetch Metadata for all cards
          this.loadAllCardsMetadata(cards);

          // Now fetch Workspace and Board Members in parallel
          forkJoin({
            workspace: this.workspaceService.getById(board.workspaceId).pipe(catchError(() => of(null))),
            wsMembers: this.workspaceService.getMembers(board.workspaceId).pipe(catchError(() => of([]))),
            boardMembers: this.boardService.getBoardMembers(board.boardId).pipe(catchError(() => of([])))
          }).subscribe({
            next: (results: any) => {
              const workspace = results.workspace;
              const wsMembers: any[] = results.wsMembers;
              const boardMembers: BoardMember[] = results.boardMembers;
              
              const currentUser = this.authService.currentUser();
              if (!currentUser) {
                this.isLoading.set(false);
                return;
              }

              const meInWs = wsMembers.find((m: any) => m.userId === currentUser.userId);
              
              // ADMIN Rights: 
              // 1. Platform Admin 
              // 2. Workspace Owner 
              // 3. Workspace Admin (role in wsMembers)
              const isWsAdmin = currentUser.role === 'ADMIN' || 
                               currentUser.role === 'PLATFORM_ADMIN' || 
                               workspace?.ownerId === currentUser.userId || 
                               meInWs?.role === 'ADMIN';

              const userMember = boardMembers.find((m: BoardMember) => m.userId === currentUser.userId);
              
              // Enrich board members with user info for avatars
              if (boardMembers.length > 0) {
                const enrichedRequests = boardMembers.map(m => 
                  this.authService.getUserById(m.userId).pipe(
                    map((u: User) => ({ ...m, fullName: u.fullName, email: u.email })),
                    catchError(() => of(m))
                  )
                );
                forkJoin(enrichedRequests).subscribe(enriched => {
                  this.boardMembers.set(enriched);
                });
              } else {
                this.boardMembers.set([]);
              }

              // You are a Board Admin if: You are a Workspace Admin OR a Board Admin OR the Board Creator
              const isAdmin = isWsAdmin || userMember?.role === 'ADMIN' || board.createdById === currentUser.userId;
              this.isBoardAdmin.set(isAdmin);
              
              // You can edit if: You are an Admin OR a Board Member
              this.canEdit.set(isAdmin || userMember?.role === 'MEMBER');
              this.isLoading.set(false);
            },
            error: (err: any) => {
              console.error(err);
              this.isLoading.set(false);
            }
          });
        });
      });
    });
  }

  dropList(event: CdkDragDrop<{ list: TaskList, cards: Card[] }[]>) {
    this.boardLists.update(lists => {
      moveItemInArray(lists, event.previousIndex, event.currentIndex);
      return [...lists];
    });
    
    // Call backend to update list positions
    const listIds = this.boardLists().map(l => l.list.listId);
    if(this.boardId) {
      this.listService.reorderLists(this.boardId, listIds).subscribe();
    }
  }

  dropCard(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Call backend to reorder cards within same list
      const listId = Number(event.container.id.replace('list-', ''));
      const cardIds = event.container.data.map(c => c.cardId);
      this.cardService.reorderCards(listId, cardIds).subscribe();
      
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const card = event.container.data[event.currentIndex];
      const targetListId = Number(event.container.id.replace('list-', ''));
      const fromListId = Number(event.previousContainer.id.replace('list-', ''));

      const fromList = this.boardLists().find(l => l.list.listId === fromListId)?.list;
      const toList = this.boardLists().find(l => l.list.listId === targetListId)?.list;
      
      // Call backend to move card to new list
      this.cardService.moveCard(card.cardId, targetListId, event.currentIndex).subscribe();

      // Log move activity
      const user = this.authService.currentUser();
      if (user && fromList && toList) {
        this.activityService.logActivity({
          cardId: card.cardId,
          actorId: user.userId || user.id,
          actorName: user.fullName,
          action: 'MOVE',
          details: `moved this card from "${fromList.name}" to "${toList.name}"`,
          oldValue: fromList.name,
          newValue: toList.name
        }).subscribe();
      }
    }
  }

  addList() {
    if (!this.newListTitle.trim() || !this.boardId) return;

    const list: Partial<TaskList> = {
      boardId: this.boardId,
      name: this.newListTitle.trim(),
      position: this.boardLists().length
    };

    this.listService.createList(list).subscribe(newList => {
      this.boardLists.update(lists => [...lists, { list: newList, cards: [] }]);
      this.newListTitle = '';

      // Notify creator only
      const currentUser = this.authService.currentUser();
      const currentUserId = currentUser?.id || currentUser?.userId || 1;
      this.notificationService.createNotification({
        recipientId: currentUserId,
        message: `Created a new list: ${newList.name}`,
        relatedId: this.boardId,
        relatedType: 'BOARD'
      }).subscribe();
    });
  }

  addCard(listId: number) {
    const title = this.newCardTitles[listId]?.trim();
    if (!title || !this.boardId) return;

    const listGroup = this.boardLists().find(l => l.list.listId === listId);
    const position = listGroup ? listGroup.cards.length : 0;

    const currentUser = this.authService.currentUser();
    const card: Partial<Card> = {
      boardId: this.boardId,
      listId: listId,
      title: title,
      position: position,
      priority: 'MEDIUM',
      status: 'TO_DO',
      createdById: currentUser?.id || currentUser?.userId || 1
    };

    this.cardService.createCard(card).subscribe(newCard => {
      this.boardLists.update(lists => {
        const targetList = lists.find(l => l.list.listId === listId);
        if (targetList) {
          targetList.cards.push(newCard);
        }
        return [...lists]; // Trigger change detection
      });
      this.newCardTitles[listId] = ''; // Reset input

      // Notify creator only
      const currentUserId = currentUser?.id || currentUser?.userId || 1;
      this.notificationService.createNotification({
        recipientId: currentUserId,
        message: `Created a new card: ${newCard.title}`,
        relatedId: newCard.cardId,
        relatedType: 'CARD'
      }).subscribe();
    });
  }

  toggleCardCompletion(event: Event, card: Card) {
    event.stopPropagation();
    const newStatus = card.status === 'DONE' ? 'TO_DO' : 'DONE';
    this.cardService.updateCard(card.cardId, { status: newStatus }).subscribe(updatedCard => {
      card.status = newStatus;
    });
  }

  startEditCardTitle(card: Card) {
    this.editingCardId = card.cardId;
    this.editCardTitle = card.title;
  }

  cancelEditCardTitle() {
    this.editingCardId = null;
    this.editCardTitle = '';
  }

  saveCardTitle(card: Card) {
    if (this.editingCardId === card.cardId) {
      const newTitle = this.editCardTitle.trim();
      if (newTitle && newTitle !== card.title) {
        this.cardService.updateCard(card.cardId, { title: newTitle }).subscribe(() => {
          card.title = newTitle;
          this.editingCardId = null;
          this.snackBar.open('Card title updated successfully', 'OK', { duration: 3000 });
        });
      } else {
        this.editingCardId = null;
      }
    }
  }

  openMoveCardDialog(card: Card) {
    if (!this.boardId) return;
    const dialogRef = this.dialog.open(CardMoveCopyDialogComponent, {
      width: '420px',
      data: {
        card,
        action: 'MOVE',
        currentBoardId: this.boardId,
        currentListId: card.listId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBoardData();
      }
    });
  }

  openCopyCardDialog(card: Card) {
    if (!this.boardId) return;
    const dialogRef = this.dialog.open(CardMoveCopyDialogComponent, {
      width: '420px',
      data: {
        card,
        action: 'COPY',
        currentBoardId: this.boardId,
        currentListId: card.listId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBoardData();
      }
    });
  }

  archiveCard(card: Card) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Archive Card',
        message: `Are you sure you want to archive "${card.title}"? You can recover it from the archive list later.`,
        confirmText: 'Archive',
        isDestructive: true
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cardService.archiveCard(card.cardId).subscribe({
          next: () => {
            this.snackBar.open(`Card "${card.title}" archived successfully`, 'OK', { duration: 3000 });
            this.loadBoardData();
          },
          error: () => {
            this.snackBar.open('Failed to archive card', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }

  openCardDetails(card: Card) {
    if (!this.boardId) return;
    const dialogRef = this.dialog.open(CardDetailDialogComponent, {
      width: '768px',
      maxWidth: '90vw',
      data: { card, boardId: this.boardId, canEdit: this.canEdit() }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Refresh board data when modal closes to reflect any label/title changes
      this.loadBoardData();
    });
  }

  openVisibilityDialog() {
    if (!this.board()) return;
    
    this.workspaceService.getById(this.board()!.workspaceId).subscribe(ws => {
      const dialogRef = this.dialog.open(BoardVisibilityDialogComponent, {
        width: '400px',
        data: { 
          currentVisibility: this.board()!.visibility, 
          workspaceName: ws.name 
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.updateVisibility(result);
        }
      });
    });
  }

  updateVisibility(visibility: string) {
    if (!this.boardId || !this.board()) return;
    
    const updatedBoard = { ...this.board()!, visibility };
    this.boardService.updateBoard(this.boardId, updatedBoard).subscribe(res => {
      this.board.set(res);
    });
  }

  closeBoard() {
    if (!this.boardId || !this.board()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Close Board',
        message: `Are you sure you want to close board "${this.board()?.name}"? It will be archived and removed from your active board list, but you can reopen it later from the dashboard.`,
        confirmText: 'Close Board',
        isDestructive: true
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.boardId) {
        this.boardService.updateBoard(this.boardId, { isClosed: true }).subscribe(() => {
          this.router.navigate(['/dashboard']);
        });
      }
    });
  }
  reopenBoard() {
    if (!this.boardId || !this.board()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reopen Board',
        message: `Are you sure you want to reopen board "${this.board()?.name}"?`,
        confirmText: 'Reopen Board',
        isDestructive: false
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.boardId) {
        this.boardService.reopenBoard(this.boardId).subscribe(res => {
          this.board.set(res);
        });
      }
    });
  }

  goToMembers() {
    if (this.boardId) {
      this.router.navigate(['/board', this.boardId, 'members']);
    }
  }

  getAvatarColor(userId: number): string {
    const colors = ['#0052CC', '#36B37E', '#FF991F', '#FF5630', '#6554C0', '#00A3BF', '#FF7452', '#2684FF'];
    return colors[userId % colors.length];
  }

  toggleStar() {
    if (!this.boardId || !this.board()) return;
    const current = !!this.board()?.isStarred;
    this.boardService.updateBoard(this.boardId, { isStarred: !current }).subscribe(res => {
      this.board.set(res);
    });
  }

  toggleCardDone(event: MouseEvent, card: Card) {
    event.stopPropagation();
    const newStatus = card.status === 'DONE' ? 'TO_DO' : 'DONE';
    this.cardService.updateCard(card.cardId, { status: newStatus }).subscribe(updatedCard => {
      // Update local state
      this.boardLists.update(lists => {
        return lists.map(l => ({
          ...l,
          cards: l.cards.map(c => c.cardId === card.cardId ? { ...c, status: newStatus } : c)
        }));
      });
      this.snackBar.open(`Card "${card.title}" marked as ${newStatus === 'DONE' ? 'Done' : 'Incomplete'}`, 'OK', { duration: 3000 });
    });
  }

  loadAllCardsMetadata(cards: Card[]) {
    cards.forEach(card => {
      // Fetch Labels
      this.labelService.getLabelsForCard(card.cardId).subscribe(labels => {
        this.cardLabels.update(map => ({
          ...map,
          [card.cardId]: labels.map(l => l.labelId)
        }));
      });

      // Fetch Checklists
      this.labelService.getChecklistsByCard(card.cardId).subscribe(checklists => {
        let total = 0;
        let completed = 0;
        checklists.forEach(cl => {
          total += cl.items?.length || 0;
          completed += (cl.items || []).filter(i => i.isCompleted).length;
        });
        this.cardChecklistStats.update(map => ({
          ...map,
          [card.cardId]: { total, completed, count: checklists.length }
        }));
      });
    });
  }

  getLabelColor(labelId: number): string {
    return this.boardLabels().find(l => l.labelId === labelId)?.color || '#dfe1e6';
  }

  getLabelName(labelId: number): string {
    return this.boardLabels().find(l => l.labelId === labelId)?.name || '';
  }

  openBoardMenu() {
    // This will eventually open the right sidebar
    console.log('Opening board menu...');
  }

  // Utility methods for Card UI
  isOverdue(card: Card): boolean {
    if (!card.dueDate || card.status === 'DONE') return false;
    return new Date(card.dueDate) < new Date();
  }

  isDueSoon(date: string | undefined): boolean {
    if (!date) return false;
    const dueDate = new Date(date);
    const now = new Date();
    if (dueDate < now) return false;
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const diff = dueDate.getTime() - now.getTime();
    return diff <= threeDaysMs;
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return 'priority_high';
      case 'HIGH': return 'arrow_upward';
      case 'LOW': return 'arrow_downward';
      default: return 'remove';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-green-600';
      case 'LOW': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  }
}
