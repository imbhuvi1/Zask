import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-6 max-w-md bg-white rounded-2xl">
      <div class="flex items-center gap-3 mb-4">
        <div [class]="data.isDestructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'" 
             class="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
          <mat-icon>{{ data.isDestructive ? 'report_problem' : 'help_outline' }}</mat-icon>
        </div>
        <h2 class="text-xl font-bold text-[#172b4d]">{{ data.title }}</h2>
      </div>
      
      <p class="text-gray-600 mb-8 leading-relaxed">{{ data.message }}</p>
      
      <div class="flex items-center justify-end gap-3">
        <button mat-button (click)="onCancel()" class="!text-gray-500 font-bold uppercase tracking-wider text-xs">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button [color]="data.isDestructive ? 'warn' : 'primary'" 
                mat-flat-button 
                (click)="onConfirm()"
                class="!rounded-lg !px-6 font-bold uppercase tracking-wider text-xs">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
