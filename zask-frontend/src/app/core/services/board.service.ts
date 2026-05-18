import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Board, BoardMember } from '../models/board.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/boards`;
  
  // State for sharing board theme across layouts
  currentBoardBackground = signal<string | null>(null);

  createBoard(board: Partial<Board>): Observable<Board> {
    return this.http.post<Board>(this.apiUrl, board);
  }

  getBoardById(boardId: number): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/${boardId}`);
  }

  getBoardsByWorkspace(workspaceId: number | string): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.apiUrl}/workspace/${workspaceId}`);
  }

  getPublicBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.apiUrl}/public`);
  }

  getBoardsByMember(userId: number): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.apiUrl}/member/${userId}`);
  }

  updateBoard(boardId: number, board: Partial<Board>): Observable<Board> {
    return this.http.put<Board>(`${this.apiUrl}/${boardId}`, board);
  }

  deleteBoard(boardId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${boardId}`);
  }

  deleteBoardsByWorkspace(workspaceId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/workspace/${workspaceId}`);
  }

  getBoardMembers(boardId: number): Observable<BoardMember[]> {
    return this.http.get<BoardMember[]>(`${this.apiUrl}/${boardId}/members`);
  }

  addMember(boardId: number, memberRequest: any): Observable<BoardMember> {
    return this.http.post<BoardMember>(`${this.apiUrl}/${boardId}/members`, memberRequest);
  }

  removeMember(boardId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${boardId}/members/${userId}`);
  }

  removeMemberFromWorkspaceBoards(workspaceId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/workspace/${workspaceId}/members/${userId}`);
  }

  updateMemberRole(boardId: number, userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${boardId}/members/${userId}`, { role });
  }

  searchBoards(name: string): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.apiUrl}/search`, { params: { name } });
  }

  reopenBoard(boardId: number): Observable<Board> {
    return this.http.put<Board>(`${this.apiUrl}/${boardId}`, { isClosed: false });
  }
}
