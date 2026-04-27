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
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  // Dashboard placeholder (will be protected)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/workspace/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'workspace/:id',
    loadComponent: () => import('./features/workspace/workspace-detail.component').then(m => m.WorkspaceDetailComponent),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'board/:id',
    loadComponent: () => import('./features/board/board.component').then(m => m.BoardComponent),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
  }
];
