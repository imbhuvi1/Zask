import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  // Dashboard placeholder (will be protected)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/workspace/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
  }
];
