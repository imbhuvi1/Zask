import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { BoardService } from '../../core/services/board.service';

@Component({
  selector: 'app-join-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './join-page.component.html'
})
export class JoinPageComponent implements OnInit {
  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private boardService = inject(BoardService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  type!: 'workspace' | 'board';
  id!: number;
  entityName = signal<string>('');
  isLoading = signal<boolean>(true);
  isJoining = signal<boolean>(false);

  ngOnInit() {
    this.route.url.subscribe(url => {
      this.type = url[1].path as 'workspace' | 'board';
      this.id = +this.route.snapshot.params['id'];
      
      if (!this.authService.isAuthenticated()) {
        this.snackBar.open('Please login to join', 'Close', { duration: 3000 });
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        return;
      }

      this.loadEntityInfo();
    });
  }

  loadEntityInfo() {
    this.isLoading.set(true);
    if (this.type === 'workspace') {
      this.workspaceService.getById(this.id).subscribe({
        next: (ws) => {
          this.entityName.set(ws.name);
          this.isLoading.set(false);
        },
        error: () => {
          this.snackBar.open('Workspace not found', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        }
      });
    } else {
      this.boardService.getBoardById(this.id).subscribe({
        next: (b) => {
          this.entityName.set(b.name);
          this.isLoading.set(false);
        },
        error: () => {
          this.snackBar.open('Board not found', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  join() {
    this.isJoining.set(true);
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;

    const req = { userId: userId, role: 'MEMBER' };

    if (this.type === 'workspace') {
      this.workspaceService.addMember(this.id, req).subscribe({
        next: () => {
          this.snackBar.open(`Successfully joined ${this.entityName()}!`, 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard'], { queryParams: { workspaceId: this.id } });
        },
        error: (err) => {
          this.snackBar.open('Failed to join workspace. You might already be a member.', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        }
      });
    } else {
      this.boardService.addMember(this.id, req).subscribe({
        next: () => {
          this.snackBar.open(`Successfully joined ${this.entityName()}!`, 'Close', { duration: 3000 });
          this.router.navigate(['/board', this.id]);
        },
        error: (err) => {
          this.snackBar.open('Failed to join board. You might already be a member.', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }
}
