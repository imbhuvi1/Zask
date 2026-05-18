import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Workspace } from '../models/workspace.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  
  private baseUrl = environment.apiUrl;
  private authUrl = `${this.baseUrl}/auth/admin`;
  private workspaceUrl = `${this.baseUrl}/workspaces/admin`;
  private auditUrl = `${this.baseUrl}/audit`;
  private notificationUrl = `${this.baseUrl}/notifications/broadcast`;
  private cardUrl = `${this.baseUrl}/cards`;

  // Users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.authUrl}/users`);
  }

  toggleUserStatus(userId: number, isActive: boolean): Observable<any> {
    return this.http.put(`${this.authUrl}/users/${userId}/status`, { isActive });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.authUrl}/users/${userId}`);
  }

  deleteWorkspace(workspaceId: number): Observable<any> {
    // Correcting the workspace deletion path to match WorkspaceResource
    return this.http.delete(`${this.baseUrl}/workspaces/${workspaceId}`);
  }

  // Workspaces
  getAllWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.workspaceUrl}/workspaces`);
  }

  // Audit Logs
  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(this.auditUrl);
  }

  // Broadcast
  sendBroadcast(data: { title: string, message: string, type: string }): Observable<any> {
    return this.http.post(this.notificationUrl, data);
  }

  // SLA Monitoring
  getOverdueCards(): Observable<any[]> {
    return this.http.get<any[]>(`${this.cardUrl}/overdue`);
  }
}
