import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-workspace-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, 
    MatDialogModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Create New Workspace</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="workspace-form">
        <mat-form-field appearance="outline">
          <mat-label>Workspace Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Marketing Team">
          <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="What is this workspace for?"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">Create</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .workspace-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 8px;
    }
  `]
})
export class WorkspaceDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<WorkspaceDialogComponent>);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
