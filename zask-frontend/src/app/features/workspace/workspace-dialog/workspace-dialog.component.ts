import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-workspace-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, 
    MatDialogModule, MatIconModule
  ],
  template: `
    <div class="flex flex-col md:flex-row w-[90vw] max-w-[850px] min-h-[500px] bg-white rounded-lg overflow-hidden font-sans relative">
      
      <!-- Close Button -->
      <button mat-icon-button mat-dialog-close class="!absolute !right-4 !top-4 !text-gray-500 hover:!bg-gray-100 !z-50">
        <mat-icon>close</mat-icon>
      </button>

      <!-- Left Column: Form -->
      <div class="flex-1 p-10 md:p-14 flex flex-col justify-center">
        <div class="mb-8">
          <h1 class="text-2xl md:text-3xl font-bold text-[#172b4d] mb-4">Let's build a Workspace</h1>
          <p class="text-[#44546f] text-base leading-relaxed">
            Boost your productivity by making it easier for everyone to access boards in one location.
          </p>
        </div>

        <form [formGroup]="form" class="flex flex-col gap-6">
          <div class="flex flex-col">
            <label class="text-xs font-bold text-[#44546f] mb-1">Workspace name</label>
            <input type="text" formControlName="name" 
                   class="w-full border-2 border-[#edeff2] focus:border-[#388bff] rounded p-2.5 text-sm outline-none transition-all placeholder:text-gray-300"
                   placeholder="Taco's Co.">
            <span class="text-[11px] text-[#44546f] mt-1.5">This is the name of your company, team or organization.</span>
            <div *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="text-red-600 text-xs mt-1">
              Workspace name is required
            </div>
          </div>

          <div class="flex flex-col">
            <label class="text-xs font-bold text-[#44546f] mb-1">Visibility</label>
            <select formControlName="visibility" 
                    class="w-full border-2 border-[#edeff2] focus:border-[#388bff] rounded p-2.5 text-sm outline-none transition-all bg-white cursor-pointer">
              <option value="PRIVATE">Private - Only you can see this</option>
              <option value="WORKSPACE">Workspace - Everyone in your workspace can see this</option>
              <option value="PUBLIC">Public - Anyone on the platform can see this</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="text-xs font-bold text-[#44546f] mb-1">Workspace description <span class="text-gray-400 font-normal ml-1">Optional</span></label>
            <textarea formControlName="description" rows="5"
                      class="w-full border-2 border-[#edeff2] focus:border-[#388bff] rounded p-2.5 text-sm outline-none transition-all resize-none placeholder:text-gray-300"
                      placeholder="Our team organizes everything here."></textarea>
            <span class="text-[11px] text-[#44546f] mt-1.5">Get your members on board with a few words about your Workspace.</span>
          </div>

          <button mat-flat-button 
                  class="!w-full !py-6 !rounded !font-bold !mt-4 transition-all"
                  [disabled]="form.invalid" (click)="onSubmit()"
                  [ngClass]="form.invalid ? '!bg-[#f1f2f4] !text-[#a5adba]' : '!bg-blue-600 !text-white hover:!bg-blue-700'">
            Continue
          </button>
        </form>
      </div>

      <!-- Right Column: Illustration -->
      <div class="hidden md:flex flex-1 bg-gradient-to-br from-[#e6fcff] to-[#ffffff] items-center justify-center relative overflow-hidden">
        <!-- Background Wave Pattern (Simplified) -->
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl"></div>
        <div class="absolute -left-20 -top-20 w-60 h-60 bg-cyan-50/50 rounded-full blur-3xl"></div>

        <!-- Illustration Mockup -->
        <div class="relative z-10 w-[300px] h-[220px] bg-white rounded-xl shadow-2xl p-4 flex flex-col gap-3 border border-gray-100 animate-fade-in">
          <!-- Board Header -->
          <div class="flex items-center justify-between mb-2">
             <div class="w-12 h-2 bg-gray-100 rounded"></div>
             <div class="flex gap-1">
               <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
               <div class="w-2 h-2 bg-green-400 rounded-full"></div>
             </div>
          </div>
          <!-- Board Content -->
          <div class="flex gap-3 h-full">
            <div class="flex-1 bg-gray-50 rounded p-2 flex flex-col gap-2">
               <div class="h-1 bg-gray-200 rounded w-2/3"></div>
               <div class="h-6 bg-white rounded shadow-sm border border-gray-100"></div>
               <div class="h-6 bg-white rounded shadow-sm border border-gray-100"></div>
            </div>
            <div class="flex-1 bg-gray-50 rounded p-2 flex flex-col gap-2">
               <div class="h-1 bg-gray-200 rounded w-2/3"></div>
               <div class="h-12 bg-white rounded shadow-sm border border-gray-100 flex items-end p-2">
                  <div class="w-4 h-1 bg-orange-400 rounded"></div>
               </div>
            </div>
          </div>
          <!-- Sparkles/Stars (Decorative) -->
          <mat-icon class="!absolute -top-6 -right-6 !text-cyan-200 !w-12 !h-12 !text-[48px] animate-pulse">sparkles</mat-icon>
          <mat-icon class="!absolute -bottom-4 -left-4 !text-blue-200 !w-8 !h-8 !text-[32px] animate-pulse delay-700">star</mat-icon>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; border-radius: 8px; overflow: hidden; }
    .animate-fade-in { animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class WorkspaceDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<WorkspaceDialogComponent>);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    visibility: ['PRIVATE']
  });

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
