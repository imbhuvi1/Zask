import { Component, Inject, OnInit, inject, signal, computed, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CardService } from '../../../core/services/card.service';
import { CommentService } from '../../../core/services/comment.service';
import { LabelService } from '../../../core/services/label.service';
import { AuthService } from '../../../core/services/auth.service';
import { BoardService } from '../../../core/services/board.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Card } from '../../../core/models/card.model';
import { Comment } from '../../../core/models/comment.model';
import { Label, Checklist, ChecklistItem } from '../../../core/models/label.model';
import { Activity } from '../../../core/models/activity.model';
import { Attachment } from '../../../core/models/attachment.model';
import { ActivityService } from '../../../core/services/activity.service';
import { ProfilePreviewService } from '../../../core/services/profile-preview.service';

@Component({
  selector: 'app-card-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatIconModule,
    MatButtonModule, MatInputModule, MatProgressSpinnerModule,
    MatCheckboxModule, MatDividerModule, MatDatepickerModule, MatNativeDateModule,
    MatMenuModule, MatTooltipModule, ConfirmDialogComponent
  ],
  templateUrl: './card-detail-dialog.component.html'
})
export class CardDetailDialogComponent implements OnInit {
  private cardService = inject(CardService);
  private commentService = inject(CommentService);
  private labelService = inject(LabelService);
  private authService = inject(AuthService);
  private boardService = inject(BoardService);
  private activityService = inject(ActivityService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);
  profilePreviewService = inject(ProfilePreviewService);

  isLoading = signal(true);
  card = signal<Card | null>(null);
  comments = signal<Comment[]>([]);
  checklists = signal<Checklist[]>([]);
  labels = signal<Label[]>([]); // Card labels
  boardLabels = signal<Label[]>([]); // All available board labels
  boardMembers = signal<any[]>([]); // Board members
  cardMembers = signal<any[]>([]); // Members assigned to this card
  activities = signal<Activity[]>([]);
  attachments = signal<Attachment[]>([]);
  showDetails = signal(false);

  isEditingDescription = signal(false);
  tempDescription = '';

  editingCommentId = signal<number | null>(null);
  editCommentText = '';

  newCommentText = '';
  replyingToCommentId = signal<number | null>(null);
  replyText: { [commentId: number]: string } = {};
  editingChecklistId = signal<number | null>(null);
  editingItemId = signal<number | null>(null);
  newChecklistTitle = 'Checklist';
  newItemText: { [checklistId: number]: string | undefined } = {};

  // Dates Menu & Custom Calendar State
  viewedMonth = new Date().getMonth();
  viewedYear = new Date().getFullYear();
  activeDateField: 'start' | 'due' = 'due';
  calendarStartChecked = false;
  calendarDueChecked = false;
  calendarStartDateStr = '';
  calendarDueDateStr = '';
  calendarDueTimeStr = '12:00 PM';
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  timeOptions = [
    '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];
  itemAssigneeId: { [checklistId: number]: number | null } = {};
  itemDueDate: { [checklistId: number]: string | null } = {};

  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;

  labelSearchTerm = signal('');
  newLabelName = signal('');
  selectedLabelColor = signal('#4f46e5'); // Default indigo
  isCreatingLabel = signal(false);

  memberSearchQuery = signal('');
  globalSearchResults = signal<any[]>([]);

  filteredCardMembers = computed(() => {
    const query = this.memberSearchQuery().toLowerCase().trim();
    if (!query) return this.cardMembers();
    return this.cardMembers().filter(m => 
      (m.email && m.email.toLowerCase().includes(query)) ||
      (m.fullName && m.fullName.toLowerCase().includes(query))
    );
  });

  filteredUnassignedBoardMembers = computed(() => {
    const query = this.memberSearchQuery().toLowerCase().trim();
    const assignedIds = this.cardMembers().map(m => m.userId);
    const unassigned = this.boardMembers().filter(m => !assignedIds.includes(m.userId));
    if (!query) return unassigned;
    return unassigned.filter(m => 
      (m.email && m.email.toLowerCase().includes(query)) ||
      (m.fullName && m.fullName.toLowerCase().includes(query))
    );
  });

  onMemberSearchChange(query: string) {
    this.memberSearchQuery.set(query);
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      this.globalSearchResults.set([]);
      return;
    }

    this.authService.searchUsers(trimmed).subscribe({
      next: (users) => {
        const boardUserIds = this.boardMembers().map(bm => bm.userId);
        const filteredGlobal = (users || []).filter(u => !boardUserIds.includes(u.userId || u.id));
        this.globalSearchResults.set(filteredGlobal);
      },
      error: () => {
        this.globalSearchResults.set([]);
      }
    });
  }



  labelColors = [
    { color: '#4f46e5', name: 'Indigo' },
    { color: '#10b981', name: 'Emerald' },
    { color: '#f59e0b', name: 'Amber' },
    { color: '#ef4444', name: 'Rose' },
    { color: '#06b6d4', name: 'Cyan' },
    { color: '#8b5cf6', name: 'Violet' },
    { color: '#ec4899', name: 'Pink' },
    { color: '#64748b', name: 'Slate' }
  ];

  hideCompletedItems = signal<{ [checklistId: number]: boolean }>({});

  currentUser = this.authService.currentUser;

  constructor(
    public dialogRef: MatDialogRef<CardDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { card: Card, boardId: number, canEdit: boolean }
  ) { }

  canEdit = signal(this.data.canEdit || false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.cardService.getCardById(this.data.card.cardId).subscribe(c => {
      this.card.set(c);
      this.loadComments();
      this.loadChecklists();
      this.loadLabels();
      this.loadBoardMembers();
      this.loadCardMembers();
      this.loadActivities();
      this.loadAttachments();
      this.isLoading.set(false);
    });
  }

  loadActivities() {
    this.activityService.getActivitiesByCard(this.data.card.cardId).subscribe(res => {
      this.activities.set(res.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    });
  }

  private logActivity(action: string, details: string, oldValue?: string, newValue?: string) {
    const user = this.authService.currentUser();
    if (!user) return;
    this.activityService.logActivity({
      cardId: this.data.card.cardId,
      actorId: user.userId || user.id,
      actorName: user.fullName,
      action,
      details,
      oldValue,
      newValue
    }).subscribe(() => this.loadActivities());
  }

  openProfilePreview(userId: number, event: MouseEvent) {
    this.profilePreviewService.open(userId, event);
  }

  loadAttachments() {
    this.cardService.getAttachmentsByCard(this.data.card.cardId).subscribe(res => {
      this.attachments.set(res);
    });
  }

  loadBoardMembers() {
    this.boardService.getBoardMembers(this.data.boardId).pipe(
      switchMap(members => {
        if (members.length === 0) return of([]);
        const requests = members.map(m => 
          this.authService.getUserById(m.userId).pipe(
            map(user => ({ 
              ...m, 
              fullName: user.fullName || 'Member', 
              email: user.email, 
              avatarUrl: user.avatarUrl,
              username: user.username || user.fullName
            })),
            catchError(() => of({ ...m, fullName: 'Member', email: 'Member' }))
          )
        );
        return forkJoin(requests);
      })
    ).subscribe(res => {
      this.boardMembers.set(res);
    });
  }

  loadCardMembers() {
    this.cardService.getCardMembers(this.data.card.cardId).pipe(
      switchMap(members => {
        if (members.length === 0) return of([]);
        const requests = members.map(m => 
          this.authService.getUserById(m.userId).pipe(
            map(user => ({ 
              ...m, 
              fullName: user.fullName || 'Member', 
              email: user.email, 
              avatarUrl: user.avatarUrl,
              username: user.username || user.fullName
            })),
            catchError(() => of({ ...m, fullName: 'Member', email: 'Member' }))
          )
        );
        return forkJoin(requests);
      })
    ).subscribe(res => {
      this.cardMembers.set(res);
    });
  }


  loadComments() {
    this.commentService.getCommentsByCard(this.data.card.cardId).subscribe(res => {
      // Build hierarchy
      const commentMap = new Map<number, Comment>();
      res.forEach(c => {
        c.replies = [];
        commentMap.set(c.commentId, c);
      });

      const roots: Comment[] = [];
      res.forEach(c => {
        if (c.parentCommentId) {
          const parent = commentMap.get(c.parentCommentId);
          if (parent) {
            parent.replies?.push(c);
          } else {
            roots.push(c);
          }
        } else {
          roots.push(c);
        }
      });

      // Sort roots newest first
      this.comments.set(roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      // Load reactions for each comment
      res.forEach(c => {
        this.commentService.getReactions(c.commentId).subscribe(reactions => {
          c.reactions = reactions;
          // Count likes and dislikes separately for each comment
          c.likeCount = reactions.filter(r => r.emoji === 'LIKE').length;
          c.dislikeCount = reactions.filter(r => r.emoji === 'DISLIKE').length;

          // Fetch author name if missing
          if (!c.authorName) {
            this.authService.getUserById(c.authorId).subscribe(user => {
              c.authorName = user.fullName;
              this.comments.set([...this.comments()]);
            });
          }

          // Trigger signal update once reactions are loaded for each comment
          this.comments.set([...this.comments()]);
        });
      });
    });
  }

  loadChecklists() {
    this.labelService.getChecklistsByCard(this.data.card.cardId).subscribe(res => {
      this.checklists.set(res.sort((a, b) => a.position - b.position));
    });
  }

  loadLabels() {
    this.labelService.getLabelsForCard(this.data.card.cardId).subscribe(res => {
      this.labels.set(res);
    });
    this.labelService.getLabelsByBoard(this.data.boardId).subscribe(res => {
      this.boardLabels.set(res);
    });
  }

  filteredLabels = computed(() => {
    const term = this.labelSearchTerm().toLowerCase();
    return this.boardLabels().filter(l => l.name.toLowerCase().includes(term));
  });

  hasLabel(labelId: number): boolean {
    return this.labels().some(l => l.labelId === labelId);
  }

  toggleLabel(label: Label) {
    if (this.hasLabel(label.labelId)) {
      this.labelService.removeLabelFromCard(this.data.card.cardId, label.labelId).subscribe(() => {
        this.labels.update(list => list.filter(l => l.labelId !== label.labelId));
      });
    } else {
      this.labelService.addLabelToCard(this.data.card.cardId, label.labelId).subscribe(() => {
        this.labels.update(list => [...list, label]);
      });
    }
  }

  createNewLabel() {
    if (!this.newLabelName().trim()) return;

    const request = {
      boardId: this.data.boardId,
      name: this.newLabelName().trim(),
      color: this.selectedLabelColor()
    };

    this.labelService.createLabel(request).subscribe(label => {
      this.boardLabels.update(list => [...list, label]);
      this.toggleLabel(label);
      this.newLabelName.set('');
      this.isCreatingLabel.set(false);
    });
  }

  deleteLabel(labelId: number) {
    this.labelService.deleteLabel(labelId).subscribe(() => {
      this.boardLabels.update(list => list.filter(l => l.labelId !== labelId));
      this.labels.update(list => list.filter(l => l.labelId !== labelId));
    });
  }

  isMemberAssigned(userId: number): boolean {
    return this.cardMembers().some(m => m.userId === userId);
  }

  assignMember(userId: number) {
    if (this.isMemberAssigned(userId)) {
      this.cardService.removeCardMember(this.data.card.cardId, userId).subscribe(() => {
        this.loadCardMembers();
      });
    } else {
      this.cardService.addCardMember(this.data.card.cardId, userId).subscribe(() => {
        this.loadCardMembers();
      });
    }
  }

  closeAllMenus() {
    this.menuTriggers.forEach(t => t.closeMenu());
  }

  getDueDateBadgeClass(): string {
    const card = this.card();
    if (!card) return 'bg-slate-50 text-slate-600 hover:bg-slate-100';
    if (card.status === 'DONE') {
      return 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200';
    }
    if (this.isOverdue(card.dueDate)) {
      return 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200';
    }
    if (this.isDueSoon(card.dueDate)) {
      return 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200';
    }
    return 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200';
  }

  initDatesMenuState() {
    const card = this.card();
    if (!card) return;

    if (card.startDate) {
      this.calendarStartDateStr = card.startDate.substring(0, 10);
      this.calendarStartChecked = true;
    } else {
      this.calendarStartDateStr = '';
      this.calendarStartChecked = false;
    }

    if (card.dueDate) {
      this.calendarDueDateStr = card.dueDate.substring(0, 10);
      this.calendarDueChecked = true;
      if (card.dueDate.includes('T')) {
        const timePart = card.dueDate.split('T')[1].substring(0, 5);
        this.calendarDueTimeStr = this.convert24To12(timePart);
      } else {
        this.calendarDueTimeStr = '12:00 PM';
      }
    } else {
      this.calendarDueDateStr = '';
      this.calendarDueChecked = false;
      this.calendarDueTimeStr = '12:00 PM';
    }

    const initialDate = card.dueDate ? new Date(card.dueDate) : (card.startDate ? new Date(card.startDate) : new Date());
    this.viewedMonth = initialDate.getMonth();
    this.viewedYear = initialDate.getFullYear();
    this.activeDateField = 'due';
  }

  prevMonth() {
    if (this.viewedMonth === 0) {
      this.viewedMonth = 11;
      this.viewedYear--;
    } else {
      this.viewedMonth--;
    }
  }

  nextMonth() {
    if (this.viewedMonth === 11) {
      this.viewedMonth = 0;
      this.viewedYear++;
    } else {
      this.viewedMonth++;
    }
  }

  getDaysInMonth(year: number, month: number): any[] {
    const days: any[] = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ isPadding: true });
    }

    const today = new Date();
    const todayStr = this.formatDate(today);

    for (let day = 1; day <= numDays; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = this.formatDate(dateObj);
      const isToday = dateStr === todayStr;

      days.push({
        isPadding: false,
        day,
        dateStr,
        isToday
      });
    }
    return days;
  }

  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  isDaySelected(dateStr: string): boolean {
    if (this.activeDateField === 'start') {
      return this.calendarStartDateStr === dateStr;
    } else {
      return this.calendarDueDateStr === dateStr;
    }
  }

  selectCalendarDate(dateStr: string) {
    if (this.activeDateField === 'start') {
      this.calendarStartDateStr = dateStr;
      this.calendarStartChecked = true;
    } else {
      this.calendarDueDateStr = dateStr;
      this.calendarDueChecked = true;
    }
  }

  onStartCheckChange() {
    if (this.calendarStartChecked) {
      if (!this.calendarStartDateStr) {
        this.calendarStartDateStr = this.formatDate(new Date());
      }
      this.activeDateField = 'start';
    } else {
      this.calendarStartDateStr = '';
    }
  }

  onDueCheckChange() {
    if (this.calendarDueChecked) {
      if (!this.calendarDueDateStr) {
        this.calendarDueDateStr = this.formatDate(new Date());
      }
      this.activeDateField = 'due';
    } else {
      this.calendarDueDateStr = '';
    }
  }

  convert24To12(time24: string): string {
    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutesStr} ${ampm}`;
  }

  convert12To24(time12: string): string {
    const parts = time12.split(' ');
    if (parts.length < 2) return '12:00';
    const [time, ampm] = parts;
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutesStr}`;
  }

  calculatePriorityFromDueDate(dueDateStr: string | null): string | null {
    if (!dueDateStr) return null;
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    
    const oneDayMs = 24 * 60 * 60 * 1000;
    const dueZero = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffMs = dueZero.getTime() - nowZero.getTime();
    const diffDays = Math.round(diffMs / oneDayMs);
    
    if (diffDays < 0) {
      return 'CRITICAL';
    } else if (diffDays <= 3) {
      return 'HIGH';
    } else if (diffDays >= 4 && diffDays <= 7) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  saveDates() {
    const card = this.card();
    if (!card) return;

    const startDate = this.calendarStartChecked && this.calendarStartDateStr ? `${this.calendarStartDateStr}T00:00:00` : null;
    const dueDate = this.calendarDueChecked && this.calendarDueDateStr ? `${this.calendarDueDateStr}T${this.convert12To24(this.calendarDueTimeStr)}:00` : null;

    this.cardService.setDates(card.cardId, startDate, dueDate).subscribe(updated => {
      this.card.set(updated);
      this.snackBar.open('Dates updated successfully', 'OK', { duration: 2000 });
      this.closeAllMenus();

      if (dueDate) {
        this.logActivity('DUE_DATE_CHANGE', `set the due date to ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, card.dueDate || undefined, dueDate);
      } else if (card.dueDate) {
        this.logActivity('DUE_DATE_CHANGE', 'removed the due date', card.dueDate, undefined);
      }
      if (startDate) {
        this.logActivity('DUE_DATE_CHANGE', `set the start date to ${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, card.startDate || undefined, startDate);
      }
      
      const autoPriority = this.calculatePriorityFromDueDate(dueDate);
      if (autoPriority) {
        this.cardService.updatePriority(card.cardId, autoPriority).subscribe(priorityUpdated => {
          this.card.set(priorityUpdated);
          this.snackBar.open(`Priority set to ${this.getPriorityLabel(autoPriority)} based on due date`, 'OK', { duration: 3000 });
        });
      }
    });
  }

  removeDates() {
    const card = this.card();
    if (!card) return;

    this.cardService.setDates(card.cardId, null, null).subscribe(updated => {
      this.card.set(updated);
      this.calendarStartDateStr = '';
      this.calendarDueDateStr = '';
      this.calendarStartChecked = false;
      this.calendarDueChecked = false;
      this.snackBar.open('Dates removed successfully', 'OK', { duration: 2000 });
      this.closeAllMenus();
      this.loadActivities();
    });
  }

  getMemberName(userId: number | undefined | null): string {
    if (!userId) return '';
    const member = this.boardMembers().find(m => m.userId === userId);
    return member ? member.fullName : 'User';
  }

  getMemberInitials(userId: number | undefined | null): string {
    if (!userId) return 'U';
    const name = this.getMemberName(userId);
    return name.charAt(0).toUpperCase();
  }

  startEditingDescription() {
    this.tempDescription = this.card()?.description || '';
    this.isEditingDescription.set(true);
  }

  cancelEditingDescription() {
    this.isEditingDescription.set(false);
  }

  updateCardTitle() {
    const currentCard = this.card();
    if (!currentCard) return;
    const oldTitle = this.data.card.title;
    this.cardService.updateCard(currentCard.cardId, { ...currentCard }).subscribe(updated => {
      this.card.set(updated);
      if (updated.title !== oldTitle) {
        this.logActivity('TITLE_CHANGE', `renamed this card to "${updated.title}"`, oldTitle, updated.title);
      }
    });
  }

  saveDescription() {
    const currentCard = this.card();
    if (!currentCard) return;
    this.cardService.updateCard(currentCard.cardId, { ...currentCard, description: this.tempDescription }).subscribe(updated => {
      this.card.set(updated);
      this.isEditingDescription.set(false);
    });
  }

  addComment(parentCommentId: number | null = null) {
    const text = parentCommentId ? this.replyText[parentCommentId] : this.newCommentText;
    if (!text || !text.trim()) return;

    const commentData: any = {
      cardId: this.data.card.cardId,
      content: text.trim(),
      authorId: this.currentUser()?.id || this.currentUser()?.userId || 1
    };

    if (parentCommentId) {
      commentData.parentCommentId = parentCommentId;
    }

    this.commentService.addComment(commentData).subscribe({
      next: (newComment) => {
        if (parentCommentId) {
          this.replyText[parentCommentId] = '';
          this.replyingToCommentId.set(null);

          // Notify original author
          const originalComment = this.findCommentById(this.comments(), parentCommentId);
          if (originalComment && originalComment.authorId !== this.currentUser()?.id) {
            this.notificationService.createNotification({
              recipientId: originalComment.authorId,
              actorId: this.currentUser()?.id || this.currentUser()?.userId,
              title: 'New Reply',
              message: `${this.currentUser()?.fullName} replied to your comment: "${text.substring(0, 30)}..."`,
              type: 'MENTION',
              relatedId: this.data.card.cardId,
              relatedType: 'CARD'
            }).subscribe();
          }
        } else {
          this.newCommentText = '';
        }
        this.loadComments();
        this.snackBar.open('Comment posted successfully', 'OK', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error posting comment:', err);
        this.snackBar.open('Failed to post comment. Please try again.', 'Close', { duration: 5000 });
      }
    });
  }

  private findCommentById(comments: Comment[], id: number): Comment | undefined {
    for (const c of comments) {
      if (c.commentId === id) return c;
      if (c.replies) {
        const found = this.findCommentById(c.replies, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  likeComment(commentId: number) {
    const currentUserId = this.currentUser()?.id || this.currentUser()?.userId;
    if (!currentUserId) return;

    if (this.hasLiked(commentId)) {
      this.commentService.removeReaction(commentId, currentUserId, 'LIKE').subscribe(() => this.loadComments());
    } else {
      if (this.hasDisliked(commentId)) {
        this.commentService.removeReaction(commentId, currentUserId, 'DISLIKE').subscribe(() => {
          this.commentService.addReaction(commentId, currentUserId, 'LIKE').subscribe(() => this.loadComments());
        });
      } else {
        this.commentService.addReaction(commentId, currentUserId, 'LIKE').subscribe(() => this.loadComments());
      }
    }
  }

  dislikeComment(commentId: number) {
    const currentUserId = this.currentUser()?.id || this.currentUser()?.userId;
    if (!currentUserId) return;

    if (this.hasDisliked(commentId)) {
      this.commentService.removeReaction(commentId, currentUserId, 'DISLIKE').subscribe(() => this.loadComments());
    } else {
      if (this.hasLiked(commentId)) {
        this.commentService.removeReaction(commentId, currentUserId, 'LIKE').subscribe(() => {
          this.commentService.addReaction(commentId, currentUserId, 'DISLIKE').subscribe(() => this.loadComments());
        });
      } else {
        this.commentService.addReaction(commentId, currentUserId, 'DISLIKE').subscribe(() => this.loadComments());
      }
    }
  }

  getPriorityColor() {
    const p = this.card()?.priority;
    return this.priorities.find(item => item.value === p)?.color || '#6b7280';
  }

  getPriorityBg() {
    const p = this.card()?.priority;
    return this.priorities.find(item => item.value === p)?.bg || '#f3f4f6';
  }

  getStatusColor() {
    const s = this.card()?.status;
    return this.statuses.find(item => item.value === s)?.color || '#6b7280';
  }

  getStatusBg() {
    const s = this.card()?.status;
    return this.statuses.find(item => item.value === s)?.bg || '#f3f4f6';
  }

  hasLiked(commentId: number): boolean {
    const comment = this.findCommentById(this.comments(), commentId);
    if (!comment || !comment.reactions) return false;
    return comment.reactions.some(r => r.userId === this.currentUser()?.id && r.emoji === 'LIKE');
  }

  hasDisliked(commentId: number): boolean {
    const comment = this.findCommentById(this.comments(), commentId);
    if (!comment || !comment.reactions) return false;
    return comment.reactions.some(r => r.userId === this.currentUser()?.id && r.emoji === 'DISLIKE');
  }

  onPriorityChange(priority: string) {
    const currentCard = this.card();
    if (!currentCard) return;
    this.cardService.updatePriority(currentCard.cardId, priority).subscribe(updated => {
      this.card.set(updated);
      this.snackBar.open('Priority updated', 'OK', { duration: 2000 });
    });
  }

  onStatusChange(status: string) {
    const currentCard = this.card();
    if (!currentCard) return;
    const oldStatus = currentCard.status;
    this.cardService.updateStatus(currentCard.cardId, status).subscribe(updated => {
      this.card.set(updated);
      this.snackBar.open('Status updated', 'OK', { duration: 2000 });
      this.logActivity('STATUS_CHANGE',
        `changed status from ${this.getStatusLabel(oldStatus)} to ${this.getStatusLabel(status)}`,
        oldStatus, status
      );
    });
  }

  toggleCardDone() {
    const currentCard = this.card();
    if (!currentCard) return;
    const newStatus = currentCard.status === 'DONE' ? 'TO_DO' : 'DONE';
    this.onStatusChange(newStatus);
  }

  updateCardField(fieldOrFields: string | Partial<Card>, value?: any) {
    const currentCard = this.card();
    if (!currentCard) return;
    
    let update: Partial<Card>;
    if (typeof fieldOrFields === 'string') {
      update = { [fieldOrFields]: value };
    } else {
      update = fieldOrFields;
    }
    
    this.cardService.updateCard(currentCard.cardId, update).subscribe(updated => {
      this.card.set(updated);
      const fieldName = typeof fieldOrFields === 'string' ? fieldOrFields : Object.keys(fieldOrFields)[0];
      this.snackBar.open(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated`, 'OK', { duration: 2000 });
      this.loadActivities();
    });
  }

  toggleAssignee(userId: number) {
    const currentCard = this.card();
    if (!currentCard) return;
    const isAlreadyAssigned = currentCard.assigneeId === userId;
    const newAssigneeId = isAlreadyAssigned ? null : userId;
    this.cardService.updateAssignee(currentCard.cardId, newAssigneeId).subscribe(updated => {
      this.card.set(updated);
      this.snackBar.open(isAlreadyAssigned ? 'Assignee removed' : 'Member assigned', 'OK', { duration: 2000 });
    });
  }

  isCardMemberAssigned(userId: number): boolean {
    return this.cardMembers().some(m => m.userId === userId);
  }

  toggleCardMember(userId: number) {
    const card = this.card();
    if (!card) return;

    const isBoardMember = this.boardMembers().some(bm => bm.userId === userId);
    const memberName = this.getMemberName(userId) || `User #${userId}`;

    if (this.isCardMemberAssigned(userId)) {
      this.cardService.removeCardMember(card.cardId, userId).subscribe(() => {
        this.loadCardMembers();
        this.snackBar.open('Member unassigned', 'OK', { duration: 2000 });
        this.logActivity('ASSIGNMENT', `removed ${memberName} from this card`);
      });
    } else {
      if (!isBoardMember) {
        this.boardService.addMember(this.data.boardId, { userId, role: 'MEMBER' }).subscribe({
          next: () => {
            this.cardService.addCardMember(card.cardId, userId).subscribe(() => {
              this.loadBoardMembers();
              this.loadCardMembers();
              this.snackBar.open('Member added to board and card', 'OK', { duration: 3000 });
              this.logActivity('ASSIGNMENT', `added ${memberName} to this card`);
            });
          },
          error: (err) => {
            this.snackBar.open('Failed to add member to board', 'Close', { duration: 3000 });
            console.error(err);
          }
        });
      } else {
        this.cardService.addCardMember(card.cardId, userId).subscribe(() => {
          this.loadCardMembers();
          this.snackBar.open('Member assigned', 'OK', { duration: 2000 });
        });
      }
    }
  }


  getAssignee() {
    const currentCard = this.card();
    if (!currentCard || !currentCard.assigneeId) return null;
    return this.boardMembers().find(m => m.userId === currentCard.assigneeId);
  }

  isOverdue(date: string | undefined): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  isDueSoon(date: string | undefined): boolean {
    if (!date) return false;
    const dueDate = new Date(date);
    const now = new Date();
    if (dueDate < now) return false;
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const diff = dueDate.getTime() - now.getTime();
    return diff <= threeDaysMs;
  }

  priorities = [
    { value: 'LOW', label: 'Low', color: '#166534', bg: '#f0fdf4' },
    { value: 'MEDIUM', label: 'Medium', color: '#1e40af', bg: '#eff6ff' },
    { value: 'HIGH', label: 'High', color: '#9a3412', bg: '#fff7ed' },
    { value: 'CRITICAL', label: 'Critical', color: '#991b1b', bg: '#fef2f2' }
  ];

  statuses = [
    { value: 'TO_DO', label: 'To Do', color: '#374151', bg: '#f3f4f6' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: '#1e40af', bg: '#eff6ff' },
    { value: 'IN_REVIEW', label: 'In Review', color: '#6b21a8', bg: '#f5f3ff' },
    { value: 'DONE', label: 'Done', color: '#166534', bg: '#f0fdf4' }
  ];

  coverColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#eab308', '#ec4899'];

  startEditComment(comment: Comment) {
    this.editingCommentId.set(comment.commentId);
    this.editCommentText = comment.content;
  }

  saveEditComment(commentId: number) {
    if (!this.editCommentText.trim()) return;
    this.commentService.updateComment(commentId, this.editCommentText.trim()).subscribe({
      next: () => {
        this.editingCommentId.set(null);
        this.loadComments();
        this.snackBar.open('Comment updated successfully', 'OK', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to update comment', 'Close', { duration: 5000 });
      }
    });
  }

  deleteComment(commentId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Comment',
        message: 'Do you want to delete the comment?',
        confirmText: 'Yes',
        cancelText: 'No',
        isDestructive: true
      },
      maxWidth: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commentService.deleteComment(commentId).subscribe(() => {
          this.loadComments();
        });
      }
    });
  }

  reactToComment(commentId: number, emoji: string) {
    const userId = this.currentUser()?.id || 1;
    this.commentService.addReaction(commentId, userId, emoji).subscribe(() => {
      this.loadComments();
    });
  }

  addChecklist() {
    if (!this.newChecklistTitle.trim()) return;
    this.labelService.createChecklist({
      cardId: this.data.card.cardId,
      title: this.newChecklistTitle.trim(),
      position: this.checklists().length
    }).subscribe(res => {
      this.checklists.update(list => [...list, res]);
      this.newChecklistTitle = 'Checklist';
      this.closeAllMenus();
    });
  }

  deleteChecklist(checklistId: number) {
    this.labelService.deleteChecklist(checklistId).subscribe(() => {
      this.checklists.update(list => list.filter(cl => cl.checklistId !== checklistId));
    });
  }

  addChecklistItem(checklistId: number) {
    const text = this.newItemText[checklistId]?.trim();
    if (!text) return;

    const requestPayload: any = {
      text,
      position: 0
    };

    if (this.itemAssigneeId[checklistId]) {
      requestPayload.assigneeId = this.itemAssigneeId[checklistId];
    }
    if (this.itemDueDate[checklistId]) {
      requestPayload.dueDate = this.itemDueDate[checklistId];
    }

    this.labelService.addItem(checklistId, requestPayload).subscribe(res => {
      this.checklists.update(list => {
        return list.map(cl => {
          if (cl.checklistId === checklistId) {
            return { ...cl, items: [...(cl.items || []), res] };
          }
          return cl;
        });
      });
      this.newItemText[checklistId] = '';
      this.itemAssigneeId[checklistId] = null;
      this.itemDueDate[checklistId] = null;
    });
  }

  toggleChecklistItem(item: ChecklistItem) {
    this.labelService.toggleItem(item.itemId).subscribe(() => {
      this.checklists.update(list => {
        return list.map(cl => {
          return {
            ...cl,
            items: (cl.items || []).map(i => {
              if (i.itemId === item.itemId) {
                return { ...i, isCompleted: !i.isCompleted };
              }
              return i;
            })
          };
        });
      });
    });
  }

  getChecklistProgress(cl: Checklist): number {
    if (!cl.items || cl.items.length === 0) return 0;
    const completed = cl.items.filter(i => i.isCompleted).length;
    return Math.round((completed / cl.items.length) * 100);
  }

  toggleHideCompleted(checklistId: number) {
    this.hideCompletedItems.update(map => ({
      ...map,
      [checklistId]: !map[checklistId]
    }));
  }

  startEditingChecklist(checklistId: number) {
    this.editingChecklistId.set(checklistId);
  }

  saveChecklistTitle(checklistId: number, newTitle: string) {
    this.editingChecklistId.set(null);
    if (!newTitle.trim()) return;

    this.labelService.updateChecklist(checklistId, { title: newTitle.trim() }).subscribe(updated => {
      this.checklists.update(list => {
        return list.map(cl => cl.checklistId === checklistId ? { ...cl, title: updated.title } : cl);
      });
    });
  }

  saveChecklistItemText(checklistId: number, item: ChecklistItem, newText: string) {
    this.editingItemId.set(null);
    if (!newText.trim() || newText.trim() === item.text) return;

    this.labelService.updateChecklistItem(item.itemId, { text: newText.trim() }).subscribe(updated => {
      this.checklists.update(list => {
        return list.map(cl => {
          if (cl.checklistId === checklistId) {
            return {
              ...cl,
              items: (cl.items || []).map(i => i.itemId === item.itemId ? { ...i, text: updated.text } : i)
            };
          }
          return cl;
        });
      });
    });
  }

  deleteChecklistItem(checklistId: number, itemId: number) {
    this.labelService.deleteChecklistItem(itemId).subscribe(() => {
      this.checklists.update(list => {
        return list.map(cl => {
          if (cl.checklistId === checklistId) {
            return {
              ...cl,
              items: (cl.items || []).filter(i => i.itemId !== itemId)
            };
          }
          return cl;
        });
      });
    });
  }

  onStartDateChange(event: any) {
    const startDate = event.value || event.target?.value;
    if (!startDate) return;
    this.updateCardField({ startDate: new Date(startDate).toISOString() });
  }


  updatePriority(priority: string) {
    this.updateCardField({ priority });
  }

  updateStatus(status: string) {
    this.updateCardField({ status });
  }

  updateCoverColor(color: string) {
    const update: Partial<Card> = { coverColor: color };
    if (!this.card()?.coverSize) {
      update.coverSize = 'TOP';
    }
    this.updateCardField(update);
  }

  removeCover() {
    this.cardService.removeCover(this.data.card.cardId).subscribe(() => {
      const currentCard = this.card();
      if (currentCard) {
        this.card.set({ ...currentCard, coverColor: undefined, coverSize: undefined });
      }
      this.snackBar.open('Cover removed', 'OK', { duration: 2000 });
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && this.card()) {
      this.cardService.uploadAttachment(this.card()!.cardId, file).subscribe(() => {
        this.loadAttachments();
        this.loadActivities();
      });
    }
  }

  deleteAttachment(id: number) {
    this.cardService.deleteAttachment(id).subscribe(() => {
      this.loadAttachments();
      this.loadActivities();
    });
  }


  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'TO_DO': 'To Do',
      'IN_PROGRESS': 'In Progress',
      'IN_REVIEW': 'In Review',
      'DONE': 'Done'
    };
    return statuses[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const priorities: { [key: string]: string } = {
      'LOW': 'Low',
      'MEDIUM': 'Medium',
      'HIGH': 'High',
      'CRITICAL': 'Critical'
    };
    return priorities[priority] || priority;
  }
}
