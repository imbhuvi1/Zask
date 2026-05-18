import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { Workspace } from '../../../core/models/workspace.model';
import { AuthService } from '../../../core/services/auth.service';
import { BoardService } from '../../../core/services/board.service';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-workspace-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatDividerModule, MatSnackBarModule, FormsModule],
  template: `
    <div class="max-w-4xl p-12 font-sans mx-auto">
      
      <!-- Close Button -->
      <div class="flex justify-end mb-4">
        <button (click)="router.navigate(['/dashboard'])" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <mat-icon class="text-gray-500">close</mat-icon>
        </button>
      </div>

      <h1 class="text-2xl font-bold text-[#172b4d] mb-8">Workspace settings</h1>

      <!-- Workspace Header Card -->
      <div class="flex items-start gap-4 mb-10 group">
        <div class="w-16 h-16 rounded bg-green-600 text-white flex items-center justify-center text-2xl font-bold shrink-0 shadow-sm">
          {{ workspace()?.name?.charAt(0)?.toUpperCase() || 'W' }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h2 class="text-xl font-bold text-[#172b4d]">{{ workspace()?.name }}</h2>
            <button class="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-gray-500">edit</mat-icon>
            </button>
          </div>
          <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span class="flex items-center gap-1">
              <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">lock</mat-icon>
              Private
            </span>
            <a href="http://www.dsa.com/" class="flex items-center gap-1 hover:underline text-blue-600">
              <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">public</mat-icon>
              www.dsa.com/
            </a>
          </div>
          <p class="text-[#172b4d] text-sm leading-relaxed">
            Hey its description of {{ workspace()?.name }}
          </p>
        </div>
      </div>

      <!-- Visibility Section -->
      <div class="mb-12 relative">
        <h3 class="text-base font-bold text-[#172b4d] mb-4">Workspace visibility</h3>
        <mat-divider class="!mb-6"></mat-divider>
        
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-white hover:border-gray-300 transition-all">
          <div class="flex items-center gap-3">
            <mat-icon [class.text-red-500]="workspace()?.visibility === 'PRIVATE'" 
                      [class.text-green-600]="workspace()?.visibility === 'PUBLIC'"
                      class="!text-[20px] !w-5 !h-5">
              {{ workspace()?.visibility === 'PRIVATE' ? 'lock' : 'public' }}
            </mat-icon>
            <div class="text-sm">
              <span class="font-bold text-[#172b4d]">{{ workspace()?.visibility === 'PRIVATE' ? 'Private' : 'Public' }}</span>
              <span class="text-gray-500 ml-1">{{ getVisibilityDescription() }}</span>
            </div>
          </div>
          <button (click)="showVisibilityPopup.set(!showVisibilityPopup())"
                  class="px-4 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
            Change
          </button>
        </div>

        <!-- Visibility Selection Popover -->
        <div *ngIf="showVisibilityPopup()" 
             class="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-lg shadow-2xl border border-gray-200 z-[100] p-6 animate-in fade-in zoom-in duration-200">
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-sm font-bold text-gray-600 w-full text-center">Select Workspace visibility</h4>
            <button (click)="showVisibilityPopup.set(false)" class="text-gray-400 hover:text-gray-600 absolute right-4 top-4">
              <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">close</mat-icon>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Private Option -->
            <div (click)="updateVisibility('PRIVATE')"
                 class="flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors"
                 [ngClass]="workspace()?.visibility === 'PRIVATE' ? 'bg-blue-50' : 'hover:bg-gray-50'">
              <mat-icon class="text-red-500 !text-[20px] !w-5 !h-5 mt-1">lock</mat-icon>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-[#172b4d]">Private</span>
                  <mat-icon *ngIf="workspace()?.visibility === 'PRIVATE'" class="text-gray-700 !text-[18px] !w-4.5 !h-4.5">check</mat-icon>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed mt-1">
                  This Workspace is private. It's not indexed or visible to those outside the Workspace.
                </p>
              </div>
            </div>

            <!-- Public Option -->
            <div (click)="updateVisibility('PUBLIC')"
                 class="flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors"
                 [ngClass]="workspace()?.visibility === 'PUBLIC' ? 'bg-blue-50' : 'hover:bg-gray-50'">
              <mat-icon class="text-green-600 !text-[20px] !w-5 !h-5 mt-1">public</mat-icon>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-[#172b4d]">Public</span>
                  <mat-icon *ngIf="workspace()?.visibility === 'PUBLIC'" class="text-gray-700 !text-[18px] !w-4.5 !h-4.5">check</mat-icon>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed mt-1">
                  This Workspace is public. It's visible to anyone with the link and will show up in search engines like Google. Only those invited to the Workspace can add and edit Workspace boards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Section -->
      <div class="mt-20">
        <button (click)="showDeleteModal.set(true)" class="text-red-600 hover:underline text-sm font-medium">
          Delete this Workspace?
        </button>
      </div>

    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal()" 
         class="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000] backdrop-blur-[1px]">
      <div class="bg-white rounded-lg shadow-2xl p-8 max-w-[440px] w-full mx-4 animate-in fade-in zoom-in duration-200 relative">
        <button (click)="showDeleteModal.set(false)" class="absolute right-6 top-6 text-gray-400 hover:text-gray-600">
          <mat-icon>close</mat-icon>
        </button>

        <h3 class="text-lg font-bold text-gray-700 w-full text-center mb-8">Delete Workspace?</h3>

        <div class="space-y-6">
          <p class="font-bold text-[#172b4d] text-lg leading-tight">
            Enter the Workspace name “{{ workspace()?.name }}” to delete
          </p>

          <div>
            <h4 class="text-sm font-bold text-gray-600 mb-3">Things to know:</h4>
            <ul class="space-y-3 text-sm text-gray-600 pl-1">
              <li class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0"></span>
                This is permanent and can't be undone.
              </li>
              <li class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0"></span>
                <span class="underline">All boards in this Workspace will be closed.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0"></span>
                Board admins can reopen boards.
              </li>
              <li class="flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0"></span>
                Board members will not be able to interact with closed boards.
              </li>
            </ul>
          </div>

          <div class="space-y-3">
            <label class="text-sm font-bold text-gray-700">Enter the Workspace name to delete</label>
            <input type="text" 
                   [(ngModel)]="deleteConfirmName"
                   class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm">
          </div>

          <button (click)="confirmDelete()"
                  [disabled]="deleteConfirmName() !== workspace()?.name"
                  class="w-full py-2.5 rounded font-bold text-sm transition-all shadow-sm"
                  [ngClass]="deleteConfirmName() === workspace()?.name 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
            Delete Workspace
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class WorkspaceSettingsComponent implements OnInit {
  workspaceService = inject(WorkspaceService);
  boardService = inject(BoardService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  workspaceId!: number;
  workspace = signal<Workspace | null>(null);

  // UI state
  showVisibilityPopup = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);
  deleteConfirmName = signal<string>('');

  ngOnInit() {
    this.route.parent?.params.subscribe(parentParams => {
      const id = parentParams['id'] || this.route.snapshot.params['id'];
      if (id) {
        this.workspaceId = +id;
        this.loadWorkspace();
      }
    });
  }

  loadWorkspace() {
    this.workspaceService.getById(this.workspaceId).subscribe(ws => this.workspace.set(ws));
  }

  updateVisibility(visibility: 'PRIVATE' | 'PUBLIC') {
    if (!this.workspace()) return;
    
    this.workspaceService.updateWorkspace(this.workspaceId, { visibility }).subscribe({
      next: (updated) => {
        this.workspace.set(updated);
        this.showVisibilityPopup.set(false);
        this.snackBar.open(`Workspace is now ${visibility.toLowerCase()}`, 'Close', { duration: 3000 });
      },
      error: (err) => console.error('Failed to update visibility', err)
    });
  }

  getVisibilityDescription(): string {
    const v = this.workspace()?.visibility;
    if (v === 'PRIVATE') {
      return "– This Workspace is private. It's not indexed or visible to those outside the Workspace.";
    }
    return "– This Workspace is public. It's visible to anyone with the link.";
  }

  confirmDelete() {
    if (this.deleteConfirmName() !== this.workspace()?.name) return;
    
    forkJoin({
      boards: this.boardService.deleteBoardsByWorkspace(this.workspaceId),
      workspace: this.workspaceService.deleteWorkspace(this.workspaceId.toString())
    }).subscribe({
      next: () => {
        this.snackBar.open('Workspace and all its boards deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.snackBar.open('Failed to delete workspace', 'Close', { duration: 3000 });
        console.error('Failed to delete workspace', err);
      }
    });
  }
}
