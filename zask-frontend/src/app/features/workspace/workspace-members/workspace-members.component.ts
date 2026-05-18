import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceMember, Workspace } from '../../../core/models/workspace.model';
import { BoardService } from '../../../core/services/board.service';
import { AddMemberDialogComponent } from '../../../shared/components/add-member-dialog/add-member-dialog.component';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-workspace-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './workspace-members.component.html'
})
export class WorkspaceMembersComponent implements OnInit {
  private workspaceService = inject(WorkspaceService);
  private boardService = inject(BoardService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  workspaceId!: number;
  workspace = signal<Workspace | null>(null);
  members = signal<WorkspaceMember[]>([]);
  memberToRemove = signal<WorkspaceMember | null>(null);
  currentUserId = this.authService.currentUser()?.userId || 0;

  // Search state
  searchQuery = signal<string>('');

  // Filtered members
  filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.members();
    return this.members().filter(m =>
      (m.fullName?.toLowerCase().includes(query)) ||
      (m.email?.toLowerCase().includes(query))
    );
  });

  ngOnInit() {
    this.route.parent?.params.subscribe(parentParams => {
      const id = parentParams['id'] || this.route.snapshot.params['id'];
      if (id) {
        this.workspaceId = +id;
        this.loadWorkspace();
        this.loadMembers();
      }
    });
  }

  loadWorkspace() {
    this.workspaceService.getById(this.workspaceId).subscribe({
      next: (ws) => this.workspace.set(ws),
      error: (err) => console.error('Failed to load workspace', err)
    });
  }

  loadMembers() {
    this.workspaceService.getMembers(this.workspaceId).pipe(
      switchMap(members => {
        if (members.length === 0) return of([]);
        // Enrich members with user data
        const requests = members.map(m =>
          this.authService.getUserById(m.userId).pipe(
            map(user => ({ ...m, fullName: user.fullName, email: user.email, avatarUrl: user.avatarUrl }))
          )
        );
        return forkJoin(requests);
      })
    ).subscribe({
      next: (enrichedMembers) => this.members.set(enrichedMembers),
      error: (err) => console.error('Failed to load members', err)
    });
  }

  get isOwnerOrAdmin(): boolean {
    const ws = this.workspace();
    const currentUser = this.authService.currentUser();
    if (!ws || !currentUser) return false;
    if (ws.ownerId === this.currentUserId) return true;
    if (currentUser.role === 'ADMIN' || currentUser.role === 'PLATFORM_ADMIN') return true;
    const current = this.members().find(m => m.userId === this.currentUserId);
    return current?.role === 'ADMIN';
  }

  canRemove(member: WorkspaceMember): boolean {
    const ws = this.workspace();
    if (!ws) return false;
    if (member.userId === ws.ownerId) return false; // Cant remove owner
    if (member.userId === this.currentUserId) return false; // Cant remove yourself
    return this.isOwnerOrAdmin;
  }

  canUpdateRole(member: WorkspaceMember): boolean {
    const ws = this.workspace();
    if (!ws) return false;
    if (member.userId === ws.ownerId) return false; // Cant change owner role
    return this.isOwnerOrAdmin;
  }

  openAddMemberDialog() {
    const dialogRef = this.dialog.open(AddMemberDialogComponent, {
      width: '450px',
      data: {
        type: 'workspace',
        id: this.workspaceId,
        existingMembers: this.members()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMembers();
      }
    });
  }

  updateRole(member: WorkspaceMember) {
    this.workspaceService.updateMemberRole(this.workspaceId, member.userId, member.role).subscribe({
      next: () => this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 }),
      error: (err) => {
        this.snackBar.open('Failed to update role', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  confirmRemove(member: WorkspaceMember) {
    this.memberToRemove.set(member);
  }

  removeMember() {
    const member = this.memberToRemove();
    if (!member) return;

    forkJoin({
      workspace: this.workspaceService.removeMember(this.workspaceId, member.userId),
      boards: this.boardService.removeMemberFromWorkspaceBoards(this.workspaceId, member.userId)
    }).subscribe({
      next: () => {
        this.members.update(list => list.filter(m => m.userId !== member.userId));
        this.memberToRemove.set(null);
        this.snackBar.open('Member removed from workspace and all boards', 'Close', { duration: 3000 });
      },
      error: (err: any) => {
        this.snackBar.open('Failed to remove member', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  leaveWorkspace() {
    if (this.currentUserId === this.workspace()?.ownerId) {
      this.snackBar.open('As the owner, you cannot leave this workspace. You must delete it or transfer ownership first.', 'Close', { duration: 5000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Leave Workspace',
        message: `Are you sure you want to leave the workspace "${this.workspace()?.name}"? You will lose access to all its boards and content.`,
        confirmText: 'Leave Workspace',
        isDestructive: true
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        forkJoin({
          workspace: this.workspaceService.removeMember(this.workspaceId, this.currentUserId),
          boards: this.boardService.removeMemberFromWorkspaceBoards(this.workspaceId, this.currentUserId)
        }).subscribe({
          next: () => {
            this.snackBar.open('You have left the workspace and its boards', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          },
          error: (err: any) => console.error('Failed to leave workspace', err)
        });
      }
    });
  }


  getUsername(member: WorkspaceMember): string {
    if (!member.email) return 'user' + member.userId;
    return member.email.split('@')[0];
  }

  getAvatarColor(userId: number): string {
    const colors = ['#0052CC', '#36B37E', '#FF991F', '#FF5630', '#6554C0'];
    return colors[userId % colors.length];
  }
}
