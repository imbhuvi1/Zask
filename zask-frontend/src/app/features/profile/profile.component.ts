import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog/confirm-dialog.component';
import { CardService } from '../../core/services/card.service';
import { Card } from '../../core/models/card.model';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatInputModule, 
    MatButtonModule, MatIconModule, MatDividerModule, MatSnackBarModule, 
    MatDialogModule, MatTooltipModule
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  currentUser = signal<User | null>(null);
  
  profileData = {
    fullName: '',
    username: '',
    avatarUrl: ''
  };

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit() {
    this.currentUser.set(this.authService.currentUser());
    if (this.currentUser()) {
      this.profileData = {
        fullName: this.currentUser()!.fullName || '',
        username: this.currentUser()!.username || '',
        avatarUrl: this.currentUser()!.avatarUrl || ''
      };
    }
  }

  updateProfile() {
    const user = this.currentUser();
    if (!user || !user.userId) return;

    this.authService.updateProfile(user.userId, this.profileData).subscribe({
      next: (updatedUser) => {
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
      }
    });
  }

  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 3000 });
      return;
    }

    const user = this.currentUser();
    if (!user || !user.userId) return;

    this.authService.changePassword(user.userId, {
      oldPassword: this.passwordData.oldPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: () => {
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
        this.passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => {
        this.snackBar.open('Failed to change password. Check your old password.', 'Close', { duration: 3000 });
      }
    });
  }

  deactivateAccount() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Deactivate Account',
        message: 'Are you absolutely sure you want to deactivate your account? This will log you out, and you will not be able to reactivate it without administrative assistance.',
        confirmText: 'Deactivate Permanently',
        isDestructive: true
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const user = this.currentUser();
        if (!user || !user.userId) return;

        this.authService.deactivateAccount(user.userId).subscribe({
          next: () => {
            this.authService.logout();
          },
          error: (err) => {
            this.snackBar.open('Failed to deactivate account', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
