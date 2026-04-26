import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { Workspace } from '../../../core/models/workspace.model';
import { WorkspaceDialogComponent } from '../workspace-dialog/workspace-dialog.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, 
    MatToolbarModule, MatCardModule, MatDialogModule, MatProgressSpinnerModule
  ],
  template: `
    <mat-toolbar color="primary" class="dashboard-toolbar">
      <div class="logo">
        <mat-icon>view_kanban</mat-icon>
        <span>Zask</span>
      </div>
      <span class="spacer"></span>
      <span class="welcome-text">Welcome, {{ authService.currentUser()?.username }}</span>
      <button mat-icon-button (click)="logout()">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="dashboard-content">
      <div class="header-actions">
        <h1>Your Workspaces</h1>
        <button mat-flat-button color="accent" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> Create Workspace
        </button>
      </div>

      <div class="loading-state" *ngIf="isLoading()">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="workspace-grid" *ngIf="!isLoading()">
        <mat-card class="workspace-card" *ngFor="let ws of workspaces()" (click)="goToWorkspace(ws.workspaceId)">
          <mat-card-header>
            <mat-card-title>{{ ws.name }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>{{ ws.description || 'No description provided.' }}</p>
          </mat-card-content>
        </mat-card>

        <div class="empty-state" *ngIf="workspaces().length === 0">
          <mat-icon>sentiment_dissatisfied</mat-icon>
          <h3>No Workspaces Yet</h3>
          <p>Create your first workspace to start collaborating!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .dashboard-toolbar { 
      gap: 16px; 
      .logo { display:flex; align-items:center; gap: 8px; font-weight:bold; font-size: 20px;}
    }
    .welcome-text { font-size: 14px; display: flex; align-items: center; margin-right: 16px; }
    
    .dashboard-content { 
      padding: 40px; 
      max-width: 1200px; 
      margin: 0 auto; 
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;

      h1 { margin: 0; font-size: 28px; font-weight: 600; color: #333; }
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      color: #666;

      mat-icon { font-size: 64px; height: 64px; width: 64px; margin-bottom: 16px; color: #999; }
      h3 { margin: 0 0 8px 0; font-size: 20px;}
    }

    .workspace-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .workspace-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      }

      mat-card-header {
        margin-bottom: 16px;
      }
      mat-card-title {
        color: #3f51b5;
        font-weight: 500;
      }
      p { color: #555; line-height: 1.5; margin:0;}
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  workspaces = signal<Workspace[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadWorkspaces();
  }

  loadWorkspaces() {
    this.isLoading.set(true);
    const userId = this.authService.currentUser()?.id || 1; // Assuming 1 as fallback if ID format differs, should come from currentUser
    
    // As per your backend dev structure, we fetch by ownerId
    this.workspaceService.getWorkspacesByOwner(userId).subscribe({
      next: (data) => {
        this.workspaces.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load workspaces', err);
        // Fallback or Toast here
        this.isLoading.set(false);
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(WorkspaceDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workspaceService.createWorkspace(result).subscribe({
          next: (newWorkspace) => {
            this.workspaces.update(ws => [...ws, newWorkspace]);
          },
          error: (err) => console.error('Failed to create workspace', err)
        });
      }
    });
  }

  goToWorkspace(workspaceId: number) {
    this.router.navigate(['/workspace', workspaceId]);
  }

  logout() {
    this.authService.logout();
  }
}
