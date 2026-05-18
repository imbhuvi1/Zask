import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Label, Checklist, ChecklistItem } from '../models/label.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private http = inject(HttpClient);
  private labelsApiUrl = `${environment.apiUrl}/labels`;
  private checklistsApiUrl = `${environment.apiUrl}/checklists`;

  // Labels
  getLabelsByBoard(boardId: number): Observable<Label[]> {
    return this.http.get<Label[]>(`${this.labelsApiUrl}/board/${boardId}`);
  }

  createLabel(request: { boardId: number, name: string, color: string }): Observable<Label> {
    return this.http.post<Label>(this.labelsApiUrl, request);
  }

  deleteLabel(labelId: number): Observable<any> {
    return this.http.delete<any>(`${this.labelsApiUrl}/${labelId}`);
  }

  getLabelsForCard(cardId: number): Observable<Label[]> {
    return this.http.get<Label[]>(`${this.labelsApiUrl}/card/${cardId}`);
  }

  addLabelToCard(cardId: number, labelId: number): Observable<any> {
    return this.http.post<any>(`${this.labelsApiUrl}/card/${cardId}/add/${labelId}`, {});
  }

  removeLabelFromCard(cardId: number, labelId: number): Observable<any> {
    return this.http.delete<any>(`${this.labelsApiUrl}/card/${cardId}/remove/${labelId}`);
  }

  // Checklists
  getChecklistsByCard(cardId: number): Observable<Checklist[]> {
    return this.http.get<Checklist[]>(`${this.labelsApiUrl}/checklists/card/${cardId}`);
  }

  createChecklist(request: any): Observable<Checklist> {
    return this.http.post<Checklist>(`${this.labelsApiUrl}/checklists`, request);
  }

  addItem(checklistId: number, request: any): Observable<ChecklistItem> {
    return this.http.post<ChecklistItem>(`${this.labelsApiUrl}/checklists/${checklistId}/items`, request);
  }

  toggleItem(itemId: number): Observable<any> {
    return this.http.put<any>(`${this.labelsApiUrl}/checklists/items/${itemId}/toggle`, {});
  }

  deleteChecklist(checklistId: number): Observable<any> {
    return this.http.delete<any>(`${this.labelsApiUrl}/checklists/${checklistId}`);
  }

  updateChecklist(checklistId: number, request: any): Observable<Checklist> {
    return this.http.put<Checklist>(`${this.labelsApiUrl}/checklists/${checklistId}`, request);
  }

  updateChecklistItem(itemId: number, request: any): Observable<ChecklistItem> {
    return this.http.put<ChecklistItem>(`${this.labelsApiUrl}/checklists/items/${itemId}`, request);
  }

  deleteChecklistItem(itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.labelsApiUrl}/checklists/items/${itemId}`);
  }
}
