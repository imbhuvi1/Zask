import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatToolbarModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  private router = inject(Router);
  authService = inject(AuthService);

  get isLoggedIn(): boolean {
    return !!this.authService.currentUser();
  }

  get isAdmin(): boolean {
    return this.authService.currentUser()?.role === 'ADMIN';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
