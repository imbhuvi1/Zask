import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { BoardService } from '../../../core/services/board.service';
import { User } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatIconModule, 
    MatButtonModule, 
    MatSnackBarModule
  ],
  templateUrl: './add-member-dialog.component.html'
})
export class AddMemberDialogComponent implements OnInit {
  searchEmail = '';
  foundUser = signal<User | null>(null);
  notFound = signal<boolean>(false);
  selectedRole = 'MEMBER';
  inviteLink = '';

  constructor(
    public dialogRef: MatDialogRef<AddMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: 'workspace' | 'board', id: number, existingMembers: any[] },
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private boardService: BoardService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.inviteLink = `${window.location.origin}/join/${this.data.type}/${this.data.id}`;
  }

  searchUser() {
    if (!this.searchEmail.trim()) return;

    this.authService.getUserByEmail(this.searchEmail.trim()).subscribe({
      next: (user) => {
        const alreadyMember = this.data.existingMembers.some(m => m.userId === user.userId);
        if (alreadyMember) {
          this.snackBar.open('User is already a member', 'Close', { duration: 3000 });
          this.foundUser.set(null);
          return;
        }
        this.foundUser.set(user);
        this.notFound.set(false);
      },
      error: () => {
        this.foundUser.set(null);
        this.notFound.set(true);
      }
    });
  }

  addMember() {
    const user = this.foundUser();
    if (!user) return;

    const req = { userId: user.userId, role: this.selectedRole };

    if (this.data.type === 'workspace') {
      this.workspaceService.addMember(this.data.id, req).subscribe({
        next: () => {
          this.snackBar.open('Member added successfully', 'Close', { duration: 3000 });
          
          // Notify creator only
          const currentUserId = this.authService.currentUser()?.userId || 1;
          this.notificationService.createNotification({
            recipientId: currentUserId,
            message: `Added member ${user.fullName} to the workspace as ${this.selectedRole}`,
            relatedId: this.data.id,
            relatedType: 'WORKSPACE'
          }).subscribe();

          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open('Failed to add member', 'Close', { duration: 3000 });
          console.error(err);
        }
      });
    } else {
      this.boardService.addMember(this.data.id, req).subscribe({
        next: () => {
          this.snackBar.open('Member added successfully', 'Close', { duration: 3000 });
          
          // Notify creator only
          const currentUserId = this.authService.currentUser()?.userId || 1;
          this.notificationService.createNotification({
            recipientId: currentUserId,
            message: `Added member ${user.fullName} to the board as ${this.selectedRole}`,
            relatedId: this.data.id,
            relatedType: 'BOARD'
          }).subscribe();

          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open('Failed to add member', 'Close', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  copyLink() {
    navigator.clipboard.writeText(this.inviteLink);
    this.snackBar.open('Invite link copied to clipboard!', 'Close', { duration: 3000 });
  }

  close() {
    this.dialogRef.close();
  }
}
