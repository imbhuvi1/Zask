import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Board } from '../models/board.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/boards`;

  createBoard(board: Partial<Board>): Observable<Board> {
    return this.http.post<Board>(this.apiUrl, board);
  }

  getBoardById(boardId: number): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/${boardId}`);
  }

  getBoardsByWorkspace(workspaceId: number | string): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.apiUrl}/workspace/${workspaceId}`);
  }

  updateBoard(boardId: number, board: Partial<Board>): Observable<Board> {
    return this.http.put<Board>(`${this.apiUrl}/${boardId}`, board);
  }

  deleteBoard(boardId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${boardId}`);
  }
}
