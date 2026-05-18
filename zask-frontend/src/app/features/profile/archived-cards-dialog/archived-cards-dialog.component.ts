import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CardService } from '../../../core/services/card.service';
import { AuthService } from '../../../core/services/auth.service';
import { Card } from '../../../core/models/card.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-archived-cards-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="p-6 font-sans max-w-[550px] w-full max-h-[85vh] flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
            <mat-icon class="text-indigo-600 !w-5 !h-5 !text-[20px]">archive</mat-icon>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-800 m-0 flex items-center gap-2">
              Archived Items
              <span class="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full" *ngIf="!isLoading()">
                {{ archivedCards().length }}
              </span>
            </h2>
            <p class="text-xs text-slate-400 m-0">Cards you've archived. Restore or permanently delete them below.</p>
          </div>
        </div>
        <button mat-icon-button (click)="close()" class="text-slate-400 hover:text-slate-600">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center py-12 gap-3" *ngIf="isLoading()">
        <mat-spinner diameter="32" color="primary"></mat-spinner>
        <span class="text-xs font-medium text-slate-400">Loading archived cards...</span>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto pr-1" *ngIf="!isLoading()">
        <div class="flex flex-col gap-2" *ngIf="archivedCards().length > 0">
          <div *ngFor="let card of archivedCards()" 
               class="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl transition-all group">
            <div class="flex flex-col gap-0.5 min-w-0 pr-4">
              <span class="text-sm font-semibold text-slate-700 truncate">{{ card.title }}</span>
              <span class="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ID: {{ card.cardId }}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button (click)="restoreCard(card.cardId)"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 rounded-lg text-xs font-bold transition-all border border-indigo-100/50"
                      matTooltip="Restore to board">
                <mat-icon class="!text-sm !w-4 !h-4">unarchive</mat-icon>
                Re-open
              </button>
              <button (click)="deleteCardPermanently(card.cardId)"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 active:bg-rose-200 rounded-lg text-xs font-bold transition-all border border-rose-100/50"
                      matTooltip="Delete forever">
                <mat-icon class="!text-sm !w-4 !h-4">delete_forever</mat-icon>
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="py-12 flex flex-col items-center justify-center text-center opacity-50" *ngIf="archivedCards().length === 0">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <mat-icon class="!w-8 !h-8 !text-[32px] text-slate-400">inventory_2</mat-icon>
          </div>
          <h3 class="text-sm font-bold text-slate-700 m-0">No Archived Cards</h3>
          <p class="text-xs text-slate-400 mt-1 max-w-[240px]">Cards you archive will show up here. You can restore them anytime.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: white;
      border-radius: 1rem;
    }
  `]
})
export class ArchivedCardsDialogComponent implements OnInit {
  private cardService = inject(CardService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  public dialogRef = inject(MatDialogRef<ArchivedCardsDialogComponent>);

  archivedCards = signal<Card[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadArchivedCards();
  }

  loadArchivedCards() {
    const userId = this.authService.currentUser()?.id || 1;
    this.isLoading.set(true);
    this.cardService.getArchivedCards(userId).subscribe({
      next: (cards) => {
        this.archivedCards.set(cards);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load archived items', 'OK', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  restoreCard(cardId: number) {
    this.cardService.unarchiveCard(cardId).subscribe({
      next: () => {
        this.snackBar.open('Card restored successfully', 'OK', { duration: 3000 });
        this.loadArchivedCards();
      },
      error: () => {
        this.snackBar.open('Failed to restore card', 'OK', { duration: 3000 });
      }
    });
  }

  deleteCardPermanently(cardId: number) {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Card Permanently',
        message: 'This action is irreversible. The card and all associated comments, checklists, and details will be lost forever.',
        confirmText: 'Delete Forever',
        isDestructive: true
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.cardService.deleteCard(cardId).subscribe({
          next: () => {
            this.snackBar.open('Card deleted permanently', 'OK', { duration: 3000 });
            this.loadArchivedCards();
          },
          error: () => {
            this.snackBar.open('Failed to delete card permanently', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
