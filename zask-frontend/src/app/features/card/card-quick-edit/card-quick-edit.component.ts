import { Component, Inject, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { Card } from '../../../core/models/card.model';
import { CardService } from '../../../core/services/card.service';
import { LabelService } from '../../../core/services/label.service';
import { AuthService } from '../../../core/services/auth.service';
import { BoardService } from '../../../core/services/board.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { ListService } from '../../../core/services/list.service';
import { Label } from '../../../core/models/label.model';
import { TaskList } from '../../../core/models/list.model';

@Component({
  selector: 'app-card-quick-edit',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatInputModule
  ],
  templateUrl: './card-quick-edit.component.html',
  styles: [`
    :host { display: block; }
    .quick-edit-container { position: relative; width: 100%; height: 100%; }
    .overlay-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10; }
  `]
})
export class CardQuickEditComponent implements OnInit {
  private cardService = inject(CardService);
  private labelService = inject(LabelService);
  private boardService = inject(BoardService);
  private workspaceService = inject(WorkspaceService);
  private listService = inject(ListService);
  private authService = inject(AuthService);

  cardTitle: string;
  labels = signal<Label[]>([]);
  boardLabels = signal<Label[]>([]);
  boardMembers = signal<any[]>([]);
  cardMembers = signal<any[]>([]);
  
  // For Move feature
  workspaces = signal<any[]>([]);
  selectedWorkspaceId = signal<number | null>(null);
  workspaceBoards = signal<any[]>([]);
  selectedBoardId = signal<number | null>(null);
  boardLists = signal<TaskList[]>([]);
  selectedListId = signal<number | null>(null);

  labelColors = [
    { color: '#4f46e5', name: 'Indigo' },
    { color: '#10b981', name: 'Emerald' },
    { color: '#f59e0b', name: 'Amber' },
    { color: '#ef4444', name: 'Rose' },
    { color: '#06b6d4', name: 'Cyan' },
    { color: '#8b5cf6', name: 'Violet' },
    { color: '#ec4899', name: 'Pink' },
    { color: '#64748b', name: 'Slate' }
  ];

  constructor(
    public dialogRef: MatDialogRef<CardQuickEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { card: Card, boardId: number, position: any }
  ) {
    this.cardTitle = data.card.title;
  }

  ngOnInit() {
    this.loadLabels();
    this.loadBoardMembers();
    this.loadCardMembers();
    this.loadWorkspaces();
  }

  loadLabels() {
    this.labelService.getLabelsForCard(this.data.card.cardId).subscribe(res => this.labels.set(res));
    this.labelService.getLabelsByBoard(this.data.boardId).subscribe(res => this.boardLabels.set(res));
  }

  loadBoardMembers() {
    this.boardService.getBoardMembers(this.data.boardId).subscribe(res => this.boardMembers.set(res));
  }

  loadCardMembers() {
    this.cardService.getCardMembers(this.data.card.cardId).subscribe(res => this.cardMembers.set(res));
  }

  loadWorkspaces() {
    const userId = this.authService.currentUser()?.userId;
    if (userId) {
      this.workspaceService.getWorkspacesByMember(userId).subscribe((res: any[]) => this.workspaces.set(res));
    }
  }

  onWorkspaceSelect(wsId: number) {
    this.selectedWorkspaceId.set(wsId);
    this.boardService.getBoardsByWorkspace(wsId).subscribe(res => this.workspaceBoards.set(res));
  }

  onBoardSelect(boardId: number) {
    this.selectedBoardId.set(boardId);
    this.listService.getListsByBoard(boardId).subscribe(res => this.boardLists.set(res));
  }

  hasLabel(labelId: number): boolean {
    return this.labels().some(l => l.labelId === labelId);
  }

  toggleLabel(label: Label) {
    if (this.hasLabel(label.labelId)) {
      this.labelService.removeLabelFromCard(this.data.card.cardId, label.labelId).subscribe(() => {
        this.labels.update(list => list.filter(l => l.labelId !== label.labelId));
      });
    } else {
      this.labelService.addLabelToCard(this.data.card.cardId, label.labelId).subscribe(() => {
        this.labels.update(list => [...list, label]);
      });
    }
  }

  isMemberAssigned(userId: number): boolean {
    return this.cardMembers().some(m => m.userId === userId);
  }

  toggleMember(userId: number) {
    if (this.isMemberAssigned(userId)) {
      this.cardService.removeCardMember(this.data.card.cardId, userId).subscribe(() => {
        this.loadCardMembers();
      });
    } else {
      this.cardService.addCardMember(this.data.card.cardId, userId).subscribe(() => {
        this.loadCardMembers();
      });
    }
  }

  updateCoverField(field: string, value: any) {
    this.cardService.updateCard(this.data.card.cardId, { [field]: value }).subscribe(() => {
      (this.data.card as any)[field] = value;
    });
  }

  updateCoverColor(color: string) {
    const update: any = { coverColor: color };
    if (!this.data.card.coverSize) {
      update.coverSize = 'TOP';
    }
    this.cardService.updateCard(this.data.card.cardId, update).subscribe(() => {
      this.data.card.coverColor = color;
      if (update.coverSize) this.data.card.coverSize = update.coverSize;
    });
  }

  removeCover() {
    this.cardService.removeCover(this.data.card.cardId).subscribe(() => {
      this.data.card.coverColor = undefined;
      this.data.card.coverSize = undefined;
    });
  }

  save() {
    if (this.cardTitle.trim() && this.cardTitle !== this.data.card.title) {
      this.cardService.updateCard(this.data.card.cardId, { title: this.cardTitle }).subscribe(() => {
        this.data.card.title = this.cardTitle;
        this.dialogRef.close(true);
      });
    } else {
      this.dialogRef.close();
    }
  }

  archive() {
    this.cardService.archiveCard(this.data.card.cardId).subscribe(() => {
      this.dialogRef.close('archived');
    });
  }

  moveCard() {
    if (this.selectedListId()) {
      this.cardService.moveCard(this.data.card.cardId, this.selectedListId()!, 0, this.selectedBoardId()!).subscribe(() => {
        this.dialogRef.close('moved');
      });
    }
  }
}
