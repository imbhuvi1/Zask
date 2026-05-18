import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Workspace } from '../../../core/models/workspace.model';

@Component({
  selector: 'app-board-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, 
    MatDialogModule, MatFormFieldModule, MatInputModule, 
    MatSelectModule, MatIconModule
  ],
  template: `
    <div class="p-5 min-w-[360px] bg-white rounded-lg font-sans relative">
      <!-- Close Button -->
      <button mat-icon-button mat-dialog-close class="!absolute !right-2 !top-2 !text-gray-500 hover:!bg-gray-100 !z-50">
        <mat-icon class="!text-[20px]">close</mat-icon>
      </button>

      <div class="flex flex-col gap-4">
        <h2 class="text-center text-sm font-semibold text-[#44546f] m-0">Create board</h2>

        <!-- Board Preview -->
        <div class="h-[120px] rounded-lg shadow-sm flex items-center justify-center transition-all duration-300"
             [style.background]="form.get('background')?.value">
          <div class="flex gap-2 w-4/5 h-3/4">
             <div class="flex-1 bg-white/40 rounded p-1.5 flex flex-col gap-1.5" *ngFor="let i of [1,2,3]">
               <div class="h-1 bg-white/60 rounded w-3/5"></div>
               <div class="h-1.5 bg-white rounded shadow-sm"></div>
               <div class="h-1.5 bg-white rounded shadow-sm w-3/4"></div>
               <div class="h-1.5 bg-white rounded shadow-sm"></div>
             </div>
          </div>
        </div>

        <form [formGroup]="form" class="flex flex-col gap-5 mt-1">
          <!-- Background Section -->
          <div>
            <label class="block text-[12px] font-bold text-[#44546f] mb-2 uppercase tracking-tight">Background Color</label>
            <div class="grid grid-cols-4 gap-2">
              <div *ngFor="let color of presetColors" 
                   class="h-8 rounded cursor-pointer relative hover:scale-105 transition-transform flex items-center justify-center border border-gray-100"
                   [style.background]="color"
                   [class.ring-2]="form.get('background')?.value === color"
                   [class.ring-blue-600]="form.get('background')?.value === color"
                   (click)="form.get('background')?.setValue(color)">
                <mat-icon *ngIf="form.get('background')?.value === color" class="!text-white !text-[16px] !w-4 !h-4 !font-bold">check</mat-icon>
              </div>
            </div>
          </div>

          <!-- Board Title -->
          <div class="flex flex-col">
            <label class="text-[12px] font-bold text-[#44546f] mb-1.5">Board title <span class="text-red-700">*</span></label>
            <input type="text" formControlName="name" 
                   class="w-full border-2 border-[#dcdfe4] focus:border-[#388bff] rounded p-2 text-sm outline-none transition-colors"
                   [class.border-red-700]="form.get('name')?.invalid && form.get('name')?.touched"
                   placeholder="Enter board title" cdkFocusInitial>
            <div class="mt-1.5 text-[12px] text-[#44546f] flex items-center gap-1" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
               👋 Board title is required
            </div>
          </div>

          <!-- Workspace & Visibility -->
          <div class="flex gap-4">
             <div class="flex-1">
                <label class="text-[12px] font-bold text-[#44546f] mb-1.5 block">Workspace</label>
                
                <!-- Select if multiple, otherwise locked -->
                <select *ngIf="data.workspaces && data.workspaces.length > 0 && !data.workspaceId" 
                        formControlName="workspaceId" 
                        class="w-full border-2 border-[#dcdfe4] focus:border-[#388bff] rounded p-2 text-sm outline-none bg-white cursor-pointer">
                  <option [value]="null" disabled selected>Select workspace</option>
                  <option *ngFor="let ws of data.workspaces" [value]="ws.workspaceId">{{ ws.name }}</option>
                </select>

                <div *ngIf="data.workspaceId" 
                     class="w-full border-2 border-[#dcdfe4] bg-gray-50 rounded p-2 text-sm text-gray-500 cursor-not-allowed truncate">
                  {{ getSelectedWorkspaceName() }}
                </div>
             </div>
             <div class="flex-1">
                <label class="text-[12px] font-bold text-[#44546f] mb-1.5 block">Visibility</label>
                <select formControlName="visibility" class="w-full border-2 border-[#dcdfe4] focus:border-[#388bff] rounded p-2 text-sm outline-none bg-white cursor-pointer">
                  <option value="PRIVATE">Private</option>
                  <option value="WORKSPACE">Workspace</option>
                  <option value="PUBLIC">Public</option>
                </select>
             </div>
          </div>

          <button mat-flat-button 
                  class="!w-full !mt-2 !font-bold !py-5 !rounded"
                  [disabled]="form.invalid" (click)="onSubmit()"
                  [ngClass]="form.invalid ? '!bg-[#f1f2f4] !text-[#a5adba]' : '!bg-blue-600 !text-white hover:!bg-blue-700'">
            Create
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class BoardDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<BoardDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);

  presetColors = [
    '#0079bf', '#d29034', '#519839', '#b04632',
    '#89609e', '#cd5a91', '#00aecc', '#838c91',
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)',
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)'
  ];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    visibility: ['WORKSPACE'],
    background: [this.presetColors[0]],
    workspaceId: [null, Validators.required]
  });

  ngOnInit() {
    if (this.data.workspaceId) {
      this.form.patchValue({ workspaceId: this.data.workspaceId });
    }
  }

  getSelectedWorkspaceName(): string {
    if (this.data.workspaceId && this.data.workspaces) {
      const ws = this.data.workspaces.find((w: Workspace) => w.workspaceId === this.data.workspaceId);
      return ws ? ws.name : 'Current';
    }
    return 'Current';
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
