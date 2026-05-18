import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, User } from '../models/user.model';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  // Modern Angular 17 State Management using Signals
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) { 
    this.checkInitialAuth();
  }

  private checkInitialAuth() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      this.currentUser.set(JSON.parse(userData));
      this.isAuthenticated.set(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setAuth(response))
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.setAuth(response))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setAuth(response: AuthResponse) {
    localStorage.setItem('token', response.token);
    
    // AuthResponse is flat from Java backend, map it to User object:
    const user: User = { 
      id: response.userId,
      userId: response.userId,
      email: response.email,
      role: response.role,
      fullName: response.fullName || 'User',
      username: response.fullName || 'User',
      active: true
    }; 
    
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  getProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile/${userId}`);
  }

  updateProfile(userId: number, data: { fullName?: string, username?: string, avatarUrl?: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile/${userId}`, data).pipe(
      tap(updatedUser => {
        // Update local state if the user updating is the currently logged in user
        if (this.currentUser()?.userId === userId) {
          const newUser = { ...this.currentUser()!, ...updatedUser };
          localStorage.setItem('user', JSON.stringify(newUser));
          this.currentUser.set(newUser);
        }
      })
    );
  }

  changePassword(userId: number, data: { oldPassword?: string, newPassword?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/password/${userId}`, data);
  }

  deactivateAccount(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deactivate/${userId}`);
  }

  searchUsers(name: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search`, { params: { name } });
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`, { params: { email } });
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile/${userId}`);
  }
}
