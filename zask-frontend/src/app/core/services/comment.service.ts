import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, Attachment } from '../models/comment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private commentsApiUrl = `${environment.apiUrl}/comments`;
  private attachmentsApiUrl = `${environment.apiUrl}/attachments`;

  // Comments
  getCommentsByCard(cardId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.commentsApiUrl}/card/${cardId}`);
  }

  addComment(comment: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(this.commentsApiUrl, comment);
  }

  updateComment(commentId: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.commentsApiUrl}/${commentId}`, { content });
  }

  likeComment(commentId: number): Observable<Comment> {
    return this.http.put<Comment>(`${this.commentsApiUrl}/${commentId}/like`, {});
  }

  dislikeComment(commentId: number): Observable<Comment> {
    return this.http.put<Comment>(`${this.commentsApiUrl}/${commentId}/dislike`, {});
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.commentsApiUrl}/${commentId}`);
  }

  // Attachments
  getAttachmentsByCard(cardId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.commentsApiUrl}/attachments/card/${cardId}`);
  }

  addAttachment(request: any): Observable<Attachment> {
    return this.http.post<Attachment>(`${this.commentsApiUrl}/attachments`, request);
  }

  deleteAttachment(attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.commentsApiUrl}/attachments/${attachmentId}`);
  }

  // Reactions
  getReactions(commentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.commentsApiUrl}/${commentId}/reactions`);
  }

  addReaction(commentId: number, userId: number, emoji: string): Observable<any> {
    return this.http.post(`${this.commentsApiUrl}/${commentId}/reactions`, { userId, emoji });
  }

  removeReaction(commentId: number, userId: number, emoji: string): Observable<any> {
    return this.http.delete(`${this.commentsApiUrl}/${commentId}/reactions?userId=${userId}&emoji=${encodeURIComponent(emoji)}`);
  }
}
