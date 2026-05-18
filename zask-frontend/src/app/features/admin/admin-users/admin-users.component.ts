import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule, 
    MatSlideToggleModule, FormsModule, MatDialogModule, MatSnackBarModule
  ],
  template: `
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-[#172b4d] mb-2">User Directory</h1>
      <p class="text-gray-500">Monitor and manage all user accounts across the platform.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <div class="relative w-[300px]">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 !text-[18px] !w-[18px] !h-[18px] text-gray-400">search</mat-icon>
          <input type="text" placeholder="Filter users..." 
                 class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all">
        </div>
        <div class="flex items-center gap-2">
          <button mat-stroked-button class="!border-gray-200 !text-xs !font-bold uppercase tracking-wider">
            <mat-icon class="!text-[16px] !w-4 !h-4">filter_list</mat-icon> Filters
          </button>
        </div>
      </div>

      <table mat-table [dataSource]="users()" class="w-full">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> ID </th>
          <td mat-cell *matCellDef="let user" class="!text-sm !text-gray-500"> #{{user.userId}} </td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> User </th>
          <td mat-cell *matCellDef="let user"> 
            <div class="flex items-center gap-3 py-3">
              <div class="w-9 h-9 rounded-full bg-[#0052cc] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {{ user.fullName.substring(0, 2).toUpperCase() }}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-[#172b4d]">{{user.fullName}}</span>
                <span class="text-xs text-gray-400">{{user.email}}</span>
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Username Column -->
        <ng-container matColumnDef="username">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Handle </th>
          <td mat-cell *matCellDef="let user" class="!text-sm font-medium text-blue-600"> {{'@' + user.username}} </td>
        </ng-container>
        
        <!-- Role Column -->
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Permissions </th>
          <td mat-cell *matCellDef="let user"> 
            <span class="px-2 py-1 rounded text-[10px] font-bold tracking-tight" 
                  [ngClass]="user.role === 'PLATFORM_ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'">
              {{user.role}}
            </span>
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Access </th>
          <td mat-cell *matCellDef="let user">
            <div class="flex items-center gap-2">
               <div [class]="'w-2 h-2 rounded-full ' + (user.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500')"></div>
               <mat-slide-toggle 
                 [checked]="user.active" 
                 color="primary"
                 (change)="toggleStatus(user)">
                 <span class="text-xs font-semibold" [class.text-green-600]="user.active" [class.text-red-600]="!user.active">
                   {{user.active ? 'Active' : 'Suspended'}}
                 </span>
               </mat-slide-toggle>
               <button mat-icon-button color="warn" (click)="deleteUser(user)" class="!ml-2">
                 <mat-icon class="!text-[18px]">delete_outline</mat-icon>
               </button>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns" class="!bg-transparent"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-blue-50/30 transition-colors" [class.bg-gray-50]="!row.active"></tr>
      </table>
      
      <div *ngIf="users().length === 0" class="p-12 text-center text-gray-400 italic">
        Loading user directory...
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .mat-column-id { width: 80px; }
    .mat-column-status { width: 180px; }
  `]
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  users = signal<User[]>([]);
  displayedColumns: string[] = ['id', 'name', 'username', 'role', 'status'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe(res => this.users.set(res));
  }

  toggleStatus(user: User) {
    this.adminService.toggleUserStatus(user.userId, !user.active).subscribe(() => {
      this.loadUsers();
    });
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to PERMANENTLY delete ${user.fullName}? All associated data will be purged and this action cannot be undone.`,
        confirmText: 'Delete Permanently',
        isDestructive: true
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteUser(user.userId).subscribe({
          next: () => {
            this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (err) => {
            this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
            console.error(err);
          }
        });
      }
    });
  }
}
