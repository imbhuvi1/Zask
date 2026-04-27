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

  getCardsByList(listId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/list/${listId}`);
  }

  getCardsByBoard(boardId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/board/${boardId}`);
  }

  updateCard(cardId: number, card: Partial<Card>): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${cardId}`, card);
  }

  moveCard(cardId: number, targetListId: number, newPosition: number): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${cardId}/move`, {
      targetListId,
      newPosition
    });
  }

  reorderCards(listId: number, cardIds: number[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/list/${listId}/reorder`, { cardIds });
  }

  deleteCard(cardId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cardId}`);
  }
}
