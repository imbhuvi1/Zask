import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Workspace } from '../../../core/models/workspace.model';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-workspaces',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatIconModule, MatButtonModule, 
    MatDialogModule, MatSnackBarModule
  ],
  template: `
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-[#172b4d] mb-2">Workspace Audit</h1>
      <p class="text-gray-500">Global view of all collaborative environments created on Zask.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <div class="text-sm font-bold text-gray-500">
          Showing {{ workspaces().length }} workspaces
        </div>
        <button mat-icon-button class="text-gray-400 hover:text-blue-600">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <table mat-table [dataSource]="workspaces()" class="w-full">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> WS-ID </th>
          <td mat-cell *matCellDef="let ws" class="!text-sm !text-gray-500"> #{{ws.workspaceId}} </td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Workspace </th>
          <td mat-cell *matCellDef="let ws"> 
            <div class="flex items-center gap-3 py-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {{ ws.name.substring(0, 1).toUpperCase() }}
              </div>
              <div class="flex flex-col max-w-[400px]">
                <span class="text-sm font-bold text-[#172b4d]">{{ws.name}}</span>
                <span class="text-xs text-gray-400 truncate">{{ws.description || 'No description provided.'}}</span>
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Owner Column -->
        <ng-container matColumnDef="owner">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Ownership </th>
          <td mat-cell *matCellDef="let ws" class="!text-sm"> 
            <div class="flex items-center gap-2">
              <mat-icon class="!text-[16px] !w-4 !h-4 text-gray-400">person</mat-icon>
              <span class="font-medium text-gray-700">User #{{ws.ownerId}}</span>
            </div>
          </td>
        </ng-container>
        
        <!-- Visibility Column -->
        <ng-container matColumnDef="visibility">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Privacy </th>
          <td mat-cell *matCellDef="let ws"> 
            <div class="flex items-center gap-2">
              <mat-icon class="!text-[14px] !w-3.5 !h-3.5" [class.text-green-600]="ws.visibility === 'PUBLIC'" [class.text-amber-600]="ws.visibility !== 'PUBLIC'">
                {{ ws.visibility === 'PUBLIC' ? 'public' : 'lock' }}
              </mat-icon>
              <span class="text-xs font-bold" [class.text-green-700]="ws.visibility === 'PUBLIC'" [class.text-amber-700]="ws.visibility !== 'PUBLIC'">
                {{ws.visibility}}
              </span>
            </div>
          </td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> </th>
          <td mat-cell *matCellDef="let ws" class="text-right">
            <div class="flex items-center justify-end gap-1">
              <button mat-icon-button class="text-gray-400 hover:text-blue-600">
                <mat-icon class="!text-[18px]">open_in_new</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteWorkspace(ws)">
                <mat-icon class="!text-[18px]">delete_outline</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns" class="!bg-transparent"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-green-50/30 transition-colors"></tr>
      </table>
      
      <div *ngIf="workspaces().length === 0" class="p-12 text-center text-gray-400 italic">
        No workspaces found on the platform.
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .mat-column-id { width: 100px; }
    .mat-column-actions { width: 60px; }
  `]
})
export class AdminWorkspacesComponent implements OnInit {
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  workspaces = signal<Workspace[]>([]);
  displayedColumns: string[] = ['id', 'name', 'owner', 'visibility', 'actions'];

  ngOnInit() {
    this.loadWorkspaces();
  }

  loadWorkspaces() {
    this.adminService.getAllWorkspaces().subscribe(res => this.workspaces.set(res));
  }

  deleteWorkspace(ws: Workspace) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Workspace',
        message: `Are you sure you want to PERMANENTLY delete the workspace "${ws.name}"? This will also delete all boards and cards within it. This action cannot be undone.`,
        confirmText: 'Delete Workspace',
        isDestructive: true
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteWorkspace(ws.workspaceId).subscribe({
          next: () => {
            this.snackBar.open(`Workspace "${ws.name}" deleted successfully.`, 'OK', { duration: 3000 });
            this.loadWorkspaces(); // Refresh list
          },
          error: (err) => {
            this.snackBar.open('Failed to delete workspace. It might have active boards.', 'Close', { duration: 5000 });
            console.error(err);
          }
        });
      }
    });
  }
}
