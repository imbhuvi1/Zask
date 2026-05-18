import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { BoardService } from '../../../core/services/board.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { AuthService } from '../../../core/services/auth.service';
import { BoardMember, Board } from '../../../core/models/board.model';
import { AddMemberDialogComponent } from '../../../shared/components/add-member-dialog/add-member-dialog.component';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';
import { WorkspaceMember, Workspace } from '../../../core/models/workspace.model';

@Component({
  selector: 'app-board-members',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    MatDialogModule, 
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './board-members.component.html'
})
export class BoardMembersComponent implements OnInit {
  private boardService = inject(BoardService);
  private workspaceService = inject(WorkspaceService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  boardId!: number;
  board = signal<Board | null>(null);
  members = signal<BoardMember[]>([]);
  memberToRemove = signal<BoardMember | null>(null);
  currentUserId = this.authService.currentUser()?.userId || 0;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.boardId = +params['id'];
      this.loadBoard();
      this.loadMembers();
      this.checkWsPermissions();
    });
  }

  isWsAdmin = signal(false);

  checkWsPermissions() {
    this.boardService.getBoardById(this.boardId).pipe(
      switchMap(board => forkJoin({
        workspace: this.workspaceService.getById(board.workspaceId).pipe(catchError(() => of(null))),
        members: this.workspaceService.getMembers(board.workspaceId).pipe(catchError(() => of([])))
      }))
    ).subscribe((results: { workspace: Workspace | null, members: WorkspaceMember[] }) => {
      const currentUser = this.authService.currentUser();
      const me = results.members.find((m: WorkspaceMember) => m.userId === this.currentUserId);
      const isOwner = results.workspace?.ownerId === this.currentUserId;
      const isGlobalAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'PLATFORM_ADMIN';
      
      this.isWsAdmin.set(me?.role === 'ADMIN' || isOwner || isGlobalAdmin);
    });
  }

  loadBoard() {
    this.boardService.getBoardById(this.boardId).subscribe({
      next: (b) => this.board.set(b),
      error: (err) => console.error('Failed to load board', err)
    });
  }

  loadMembers() {
    this.boardService.getBoardMembers(this.boardId).pipe(
      switchMap(members => {
        if (members.length === 0) return of([]);
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
    if (!this.authService.isAuthenticated() || this.currentUserId === 0) return false;
    if (this.isWsAdmin()) return true;
    const b = this.board();
    if (!b) return false;
    if (b.createdById === this.currentUserId) return true;
    const current = this.members().find(m => m.userId === this.currentUserId);
    return current?.role === 'ADMIN';
  }

  canRemove(member: BoardMember): boolean {
    const b = this.board();
    if (!b) return false;
    // Allow Workspace Admin to remove anyone (except themselves)
    if (this.isWsAdmin() && member.userId !== this.currentUserId) return true;
    
    // Legacy logic: Board creator usually can't be removed by other board admins
    // but Workspace Admin overrides this.
    if (member.userId === b.createdById) return false;
    if (member.userId === this.currentUserId) return false;
    return this.isOwnerOrAdmin;
  }

  canUpdateRole(member: BoardMember): boolean {
    const b = this.board();
    if (!b) return false;
    if (member.userId === b.createdById) return false;
    return this.isOwnerOrAdmin;
  }

  openAddMemberDialog() {
    const dialogRef = this.dialog.open(AddMemberDialogComponent, {
      width: '450px',
      data: { 
        type: 'board', 
        id: this.boardId, 
        existingMembers: this.members() 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMembers();
      }
    });
  }

  updateRole(member: BoardMember) {
    this.boardService.updateMemberRole(this.boardId, member.userId, member.role).subscribe({
      next: () => this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 }),
      error: (err) => {
        this.snackBar.open('Failed to update role', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  confirmRemove(member: BoardMember) {
    this.memberToRemove.set(member);
  }

  leaveBoard() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Leave Board',
        message: `Are you sure you want to leave "${this.board()?.name}"? You will lose access to this board unless you are invited back.`,
        confirmText: 'Leave Board',
        isDestructive: true
      },
      maxWidth: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardService.removeMember(this.boardId, this.currentUserId).subscribe({
          next: () => {
            this.snackBar.open('You have left the board', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          },
          error: (err) => console.error('Failed to leave board', err)
        });
      }
    });
  }

  removeMember() {
    const member = this.memberToRemove();
    if (!member) return;

    this.boardService.removeMember(this.boardId, member.userId).subscribe({
      next: () => {
        this.members.update(list => list.filter(m => m.userId !== member.userId));
        this.memberToRemove.set(null);
        this.snackBar.open('Member removed successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to remove member', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  getAvatarColor(userId: number): string {
    const colors = ['#0052CC', '#36B37E', '#FF991F', '#FF5630', '#6554C0'];
    return colors[userId % colors.length];
  }
}
