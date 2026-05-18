import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Card } from '../models/card.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cards`;

  createCard(card: Partial<Card>): Observable<Card> {
    return this.http.post<Card>(this.apiUrl, card);
  }

  getCardById(cardId: number): Observable<Card> {
    return this.http.get<Card>(`${this.apiUrl}/${cardId}`);
  }

  getCardsByList(listId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/list/${listId}`);
  }

  getCardsByBoard(boardId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/board/${boardId}`);
  }

  getCardsByAssignee(assigneeId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/assignee/${assigneeId}`);
  }

  updateCard(cardId: number, card: Partial<Card>): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${cardId}`, card);
  }

  setDates(cardId: number, startDate: string | null, dueDate: string | null): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${cardId}/dates`, { startDate, dueDate });
  }

  removeCover(cardId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cardId}/cover`);
  }

  moveCard(cardId: number, targetListId: number, newPosition: number, boardId?: number): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${cardId}/move`, {
      targetListId,
      newPosition,
      boardId
    });
  }

  archiveCard(cardId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cardId}/archive`, {});
  }

  unarchiveCard(cardId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cardId}/unarchive`, {});
  }

  reorderCards(listId: number, cardIds: number[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/list/${listId}/reorder`, { cardIds });
  }

  deleteCard(cardId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cardId}`);
  }

  updatePriority(cardId: number, priority: string): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${cardId}/priority`, { priority });
  }

  updateStatus(cardId: number, status: string): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${cardId}/status`, { status });
  }

  updateAssignee(cardId: number, assigneeId: number | null): Observable<Card> {
    const url = assigneeId 
      ? `${this.apiUrl}/${cardId}/assignee/${assigneeId}`
      : `${this.apiUrl}/${cardId}/assignee/remove`;
    return this.http.put<Card>(url, {});
  }

  getCardMembers(cardId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${cardId}/members`);
  }

  addCardMember(cardId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${cardId}/members/${userId}`, {});
  }

  removeCardMember(cardId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cardId}/members/${userId}`);
  }

  searchCards(title: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/search`, { params: { title } });
  }

  getArchivedCards(userId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/archived/user/${userId}`);
  }

  // Attachments
  getAttachmentsByCard(cardId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${cardId}/attachments`);
  }

  uploadAttachment(cardId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${cardId}/attachments`, formData);
  }

  deleteAttachment(attachmentId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/attachments/${attachmentId}`);
  }
}
