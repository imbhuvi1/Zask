import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Workspace, WorkspaceMember } from '../models/workspace.model';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/workspaces`;

  getById(workspaceId: number | string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/${workspaceId}`);
  }

  getWorkspacesByOwner(ownerId: number | string): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  getWorkspacesByMember(userId: number | string): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.apiUrl}/member/${userId}`);
  }

  createWorkspace(workspace: Partial<Workspace>): Observable<Workspace> {
    return this.http.post<Workspace>(this.apiUrl, workspace);
  }

  updateWorkspace(workspaceId: number | string, payload: Partial<Workspace>): Observable<Workspace> {
    return this.http.put<Workspace>(`${this.apiUrl}/${workspaceId}`, payload);
  }

  getMembers(workspaceId: number | string): Observable<WorkspaceMember[]> {
    return this.http.get<WorkspaceMember[]>(`${this.apiUrl}/${workspaceId}/members`);
  }

  addMember(workspaceId: number | string, memberRequest: any): Observable<WorkspaceMember> {
    return this.http.post<WorkspaceMember>(`${this.apiUrl}/${workspaceId}/members`, memberRequest);
  }

  removeMember(workspaceId: number | string, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${workspaceId}/members/${userId}`);
  }

  updateMemberRole(workspaceId: number | string, userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${workspaceId}/members/${userId}`, { role });
  }

  deleteWorkspace(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchWorkspaces(name: string): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.apiUrl}/search`, { params: { name } });
  }
}