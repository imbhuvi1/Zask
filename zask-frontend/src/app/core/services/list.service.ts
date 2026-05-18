import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TaskList } from '../models/list.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/lists`;

  createList(list: Partial<TaskList>): Observable<TaskList> {
    return this.http.post<TaskList>(this.apiUrl, list);
  }

  getListsByBoard(boardId: number): Observable<TaskList[]> {
    return this.http.get<TaskList[]>(`${this.apiUrl}/board/${boardId}`);
  }

  reorderLists(boardId: number, listIds: number[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/board/${boardId}/reorder`, { listIds });
  }

  updateList(listId: number, list: Partial<TaskList>): Observable<TaskList> {
    return this.http.put<TaskList>(`${this.apiUrl}/${listId}`, list);
  }

  deleteList(listId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${listId}`);
  }
}
