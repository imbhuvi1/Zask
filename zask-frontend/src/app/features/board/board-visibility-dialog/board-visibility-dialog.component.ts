import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-board-visibility-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './board-visibility-dialog.component.html'
})
export class BoardVisibilityDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BoardVisibilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentVisibility: string, workspaceName: string }
  ) {}

  selectVisibility(visibility: string) {
    this.dialogRef.close(visibility);
  }

  close() {
    this.dialogRef.close();
  }
}
