import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Workspace } from '../models/workspace.model';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/workspaces`;

  getWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.apiUrl);
  }

  createWorkspace(workspace: Partial<Workspace>): Observable<Workspace> {
    return this.http.post<Workspace>(this.apiUrl, workspace);
  }
  
  deleteWorkspace(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
